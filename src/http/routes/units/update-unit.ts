import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUnit } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const updateUnit: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Update unit",
        operationId: "updateUnit",
        security: [{ BearerAuth: [] }],
        description: "Update unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        body: z.object({
          name: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { unitId } = request.params
      const { name } = request.body

      const { can } = defineAbilityFor(authUser)

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const caslUnit = getCaslUnit({
        unitId: unit.id,
        companyId: unit.companyId,
        companyGroupId: unit.companyGroupId,
      })

      if (can("update", caslUnit) === false) {
        throw new ForbiddenException()
      }

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: {
          name,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
