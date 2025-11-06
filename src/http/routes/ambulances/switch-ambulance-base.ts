import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { BadRequestException } from "@/http/exceptions/bad-request-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslAmbulance } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const switchAmbulanceBase: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/ambulances/:id/base",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Switch an ambulance base",
        operationId: "switchAmbulanceBase",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: z.object({
          baseId: z.cuid(),
        }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { id } = request.params
      const { baseId } = request.body

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
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

      if (can("switchStatus", caslAmbulance) === false) {
        throw new ForbiddenException()
      }

      if (ambulance.baseId === baseId) {
        throw new BadRequestException("Ambulance already has this base")
      }

      const base = await prisma.base.findUnique({
        where: { id: baseId, deletedAt: null },
      })

      if (!base) {
        throw new ResourceNotFoundException("Base not found")
      }

      if (base.companyId !== ambulance.companyId) {
        throw new BadRequestException("Base is not from the same company")
      }

      await prisma.ambulance.update({
        where: { id },
        data: { baseId },
      })

      return reply.status(204).send(null)
    }
  )
}
