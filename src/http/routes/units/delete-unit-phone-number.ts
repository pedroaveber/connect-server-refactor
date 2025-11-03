import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUnit } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteUnitPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/units/:unitId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Delete unit phone number",
        operationId: "deleteUnitPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete unit phone number",
        params: z.object({
          unitId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { can } = defineAbilityFor(authUser)

      const { unitId, phoneId } = request.params

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      const caslUnit = getCaslUnit({
        companyId: unit.companyId,
        companyGroupId: unit.companyGroupId,
        unitId: unit.id,
      })

      if (can("update", caslUnit) === false) {
        throw new ForbiddenException()
      }

      const phone = await prisma.phone.findUnique({
        where: {
          id: phoneId,
        },
      })

      if (!phone) {
        throw new ResourceNotFoundException("Número de telefone não encontrado")
      }

      await prisma.phone.delete({
        where: {
          id: phoneId,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
