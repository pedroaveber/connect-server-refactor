import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const updateBase: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/bases/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Update base",
        operationId: "updateBase",
        params: z.object({ id: z.cuid() }),
        body: z.object({
          name: z.string(),
          document: z.string().optional(),
          latitude: z.number(),
          longitude: z.number(),
        }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { id } = request.params
      const { name, document, latitude, longitude } = request.body

      const { can } = defineAbilityFor(authUser)

      const base = await prisma.base.findUnique({ where: { id } })

      if (!base) {
        throw new ResourceNotFoundException("Base não encontrada.")
      }

      const caslBase = getCaslBase({
        baseId: base.id,
        unitId: base.unitId,
        companyId: base.companyId,
        companyGroupId: base.companyGroupId,
      })

      if (can("update", caslBase) === false) {
        throw new ForbiddenException()
      }

      const hasChangedDocument = document !== base.document

      if (hasChangedDocument) {
        const baseWithSameDocument = await prisma.base.findUnique({
          where: { document, NOT: { id } },
        })

        if (baseWithSameDocument) {
          throw new ConflictException("Base with same document already exists")
        }
      }

      await prisma.base.update({
        where: { id },
        data: { name, document, latitude, longitude },
      })

      return reply.status(204).send(null)
    }
  )
}
