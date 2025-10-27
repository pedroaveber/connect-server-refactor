import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompanyGroup } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Get company group",
        operationId: "getCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Get company group",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.cuid(),
              name: z.string(),
              document: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
              deletedAt: z.date().nullable(),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  createdAt: z.date(),
                  updatedAt: z.date(),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { companyGroupId } = request.params

      const { can } = defineAbilityFor(authUser)
      const caslCompanyGroup = getCaslCompanyGroup({ companyGroupId })

      if (can("read", caslCompanyGroup) === false) {
        throw new ForbiddenException()
      }

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
        include: {
          phones: true,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      return reply.status(200).send({
        data: companyGroup,
      })
    }
  )
}
