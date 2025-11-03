import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompany } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteCompany: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Delete company",
        operationId: "deleteCompany",
        security: [{ BearerAuth: [] }],
        description: "Delete company",
        params: z.object({
          companyId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { companyId } = request.params

      const { can } = defineAbilityFor(authUser)

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
          deletedAt: null,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const caslCompany = getCaslCompany({
        companyId: company.id,
        companyGroupId: company.companyGroupId,
      })

      if (can("delete", caslCompany) === false) {
        throw new ForbiddenException()
      }

      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send(null)
    }
  )
}
