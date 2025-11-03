import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompanyGroup } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const updateCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Update company group",
        operationId: "updateCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Update company group",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { companyGroupId } = request.params
      const { document, name } = request.body

      const caslCompanyGroup = getCaslCompanyGroup({ companyGroupId })

      const { can } = defineAbilityFor(authUser)

      if (can("update", caslCompanyGroup) === false) {
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

      const hasChangedDocument = companyGroup.document !== document

      if (hasChangedDocument) {
        const companyGroupWithSameDocument =
          await prisma.companyGroup.findFirst({
            where: {
              document,
              NOT: {
                id: companyGroupId,
              },
            },
          })

        if (companyGroupWithSameDocument) {
          throw new ConflictException(
            "Já existe um grupo empresarial com este documento"
          )
        }
      }

      await prisma.companyGroup.update({
        where: {
          id: companyGroupId,
        },
        data: {
          name,
          document,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
