import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslAmbulance } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteAmbulanceDocument: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/ambulances/:ambulanceId/documents/:documentId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Delete an ambulance document",
        operationId: "deleteAmbulanceDocument",
        security: [{ BearerAuth: [] }],
        params: z.object({ ambulanceId: z.cuid(), documentId: z.cuid() }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { ambulanceId, documentId } = request.params

      const ambulance = await prisma.ambulance.findUnique({
        where: { id: ambulanceId, deletedAt: null },
      })

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found")
      }

      const { can } = defineAbilityFor(authUser)

      const caslAmbulance = getCaslAmbulance({
        id: ambulance.id,
        baseId: ambulance.baseId,
        unitId: ambulance.unitId,
        companyId: ambulance.companyId,
        companyGroupId: ambulance.companyGroupId,
      })

      if (can("update", caslAmbulance) === false) {
        throw new ForbiddenException()
      }

      const document = await prisma.ambulanceDocuments.findUnique({
        where: { id: documentId, deletedAt: null, ambulanceId },
      })

      if (!document) {
        throw new ResourceNotFoundException("Document not found")
      }

      await prisma.ambulanceDocuments.update({
        where: { id: documentId },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send()
    }
  )
}
