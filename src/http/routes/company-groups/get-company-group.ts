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
              companiesCount: z.number(),
              invoiceMode: z.enum(["DISCRIMINATED", "GENERAL"]),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  name: z.string().nullable(),
                  isWhatsapp: z.boolean(),
                  createdAt: z.date(),
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
        select: {
          id: true,
          name: true,
          document: true,
          createdAt: true,
          updatedAt: true,
          deletedAt: true,
          invoiceMode: true,
          phones: {
            select: {
              id: true,
              number: true,
              name: true,
              isWhatsapp: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              companies: true,
            },
          },
        },
        where: {
          id: companyGroupId,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      return reply.status(200).send({
        data: {
          ...companyGroup,
          companiesCount: companyGroup._count.companies,
        },
      })
    }
  )
}
