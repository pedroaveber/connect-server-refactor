import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUnit } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteUnit: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Delete unit",
        operationId: "deleteUnit",
        security: [{ BearerAuth: [] }],
        description: "Delete unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { unitId } = request.params

      const { can } = defineAbilityFor(authUser)

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
          deletedAt: null,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      const caslUnit = getCaslUnit({
        companyId: unit.companyId,
        unitId: unit.id,
        companyGroupId: unit.companyGroupId,
      })

      if (can("delete", caslUnit) === false) {
        throw new ForbiddenException()
      }

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send(null)
    }
  )
}
