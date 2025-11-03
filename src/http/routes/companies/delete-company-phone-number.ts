import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompany } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteCompanyPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/companies/:companyId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Delete company phone number",
        operationId: "deleteCompanyPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete company phone number",
        params: z.object({
          companyId: z.cuid(),
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

      const { companyId, phoneId } = request.params

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const caslCompany = getCaslCompany({
        companyId: company.id,
        companyGroupId: company.companyGroupId,
      })

      if (can("update", caslCompany) === false) {
        throw new ForbiddenException()
      }

      const phone = await prisma.phone.findUnique({
        where: {
          id: phoneId,
          companyId,
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
