import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { BadRequestException } from "@/http/exceptions/bad-request-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Delete company group",
        operationId: "deleteCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Delete company group",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { companyGroupId } = request.params

      const { can } = defineAbilityFor(authUser)

      if (can("delete", "CompanyGroup") === false) {
        throw new ForbiddenException()
      }

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      if (companyGroup.deletedAt) {
        throw new BadRequestException("Grupo empresarial já deletado")
      }

      await prisma.companyGroup.update({
        where: {
          id: companyGroupId,
        },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send(null)
    }
  )
}
