import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getCompaniesFromUser: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users/:userId/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get companies from user",
        security: [{ BearerAuth: [] }],
        operationId: "getCompaniesFromUser",
        params: z.object({
          userId: z.string(),
        }),
        response: {
          200: z.object({
            companyGroup: z
              .object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
              })
              .nullable(),
            companies: z
              .array(
                z.object({
                  id: z.cuid(),
                  name: z.string(),
                  document: z.string(),
                })
              )
              .nullable(),
            units: z
              .array(
                z.object({
                  id: z.cuid(),
                  name: z.string(),
                })
              )
              .nullable(),
            bases: z
              .array(
                z.object({
                  id: z.cuid(),
                  document: z.string().nullable(),
                  name: z.string(),
                })
              )
              .nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { can } = defineAbilityFor(authUser)

      const { userId } = request.params

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
        },
        include: {
          organizations: {
            include: {
              base: {
                select: {
                  id: true,
                  document: true,
                  name: true,
                },
              },
              company: {
                select: {
                  id: true,
                  name: true,
                  document: true,
                },
              },
              companyGroup: {
                select: {
                  id: true,
                  name: true,
                  document: true,
                },
              },
              unit: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      })

      if (!user) {
        throw new ResourceNotFoundException("Usuário não encontrado")
      }

      const caslUser = getCaslUser({
        userId,
        roles: user.roles,
        associatedCompanyGroupId: user.associatedCompanyGroupId ?? undefined,
      })

      if (can("read", caslUser) === false) {
        throw new ForbiddenException()
      }

      let companyGroup: { id: string; name: string; document: string } | null =
        null
      const companies: { id: string; name: string; document: string }[] = []
      const units: { id: string; name: string }[] = []
      const bases: { id: string; document: string | null; name: string }[] = []

      for (const organization of user.organizations) {
        if (organization.companyGroup) {
          companyGroup = {
            id: organization.companyGroup.id,
            name: organization.companyGroup.name,
            document: organization.companyGroup.document,
          }
        }

        if (organization.company) {
          companies.push({
            id: organization.company.id,
            name: organization.company.name,
            document: organization.company.document,
          })
        }

        if (organization.unit) {
          units.push({
            id: organization.unit.id,
            name: organization.unit.name,
          })
        }

        if (organization.base) {
          bases.push({
            id: organization.base.id,
            document: organization.base.document,
            name: organization.base.name,
          })
        }
      }

      return reply.status(200).send({
        companyGroup,
        companies,
        units,
        bases,
      })
    }
  )
}
