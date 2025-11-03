import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const getUserOrganizations: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users/me/organizations",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get user organizations",
        security: [{ BearerAuth: [] }],
        operationId: "getUserOrganizations",
        response: {
          200: z.object({
            companyGroup: z
              .object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
              })
              .nullable(),
            organizations: z.array(
              z.object({
                id: z.cuid(),
                kind: z.string(),
                name: z.string(),
                document: z.string().nullish(),
                parentCompany: z.object({
                  id: z.cuid(),
                  name: z.string(),
                  document: z.string().nullish(),
                }),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { basesIds, companiesIds, companyGroupId, unitsIds, roles } =
        request.user

      const isAdmin = roles.includes("ADMIN")
      const isCompanyGroupAdmin = roles.includes("COMPANY_GROUP_ADMIN")

      let companyGroup: {
        id: string
        name: string
        document: string
      } | null = null

      if (isAdmin === true) {
        return reply.status(200).send({
          companyGroup,
          organizations: [],
        })
      }

      if (isCompanyGroupAdmin === true) {
        companyGroup = await prisma.companyGroup.findUnique({
          where: { id: companyGroupId },
          select: {
            id: true,
            name: true,
            document: true,
          },
        })

        if (!companyGroup) {
          throw new ResourceNotFoundException("Company group not found")
        }

        return reply.status(200).send({
          companyGroup: {
            id: companyGroup.id,
            name: companyGroup.name,
            document: companyGroup.document,
          },
          organizations: [],
        })
      }

      const organizations: {
        id: string
        name: string
        document?: string | null
        kind: string
        parentCompany: {
          id: string
          name: string
          document: string | null
        }
      }[] = []

      if (companiesIds && companiesIds.length > 0) {
        const companies = await prisma.company.findMany({
          where: {
            id: {
              in: companiesIds,
            },
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            document: true,
            companyGroup: {
              select: {
                id: true,
                name: true,
                document: true,
              },
            },
          },
        })

        companies.forEach((company) => {
          if (!companyGroup) {
            companyGroup = company.companyGroup
          }

          organizations.push({
            id: company.id,
            name: company.name,
            document: company.document,
            kind: "COMPANY",
            parentCompany: company.companyGroup,
          })
        })
      }

      if (unitsIds && unitsIds.length > 0) {
        const units = await prisma.unit.findMany({
          where: {
            id: {
              in: unitsIds,
            },
          },
          select: {
            id: true,
            name: true,
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
          },
        })

        units.forEach((unit) => {
          if (!companyGroup) {
            companyGroup = unit.companyGroup
          }
          organizations.push({
            id: unit.id,
            name: unit.name,
            document: null,
            kind: "UNIT",
            parentCompany: unit.company,
          })
        })
      }

      if (basesIds && basesIds.length > 0) {
        const bases = await prisma.base.findMany({
          where: {
            id: {
              in: basesIds,
            },
          },
          select: {
            id: true,
            name: true,
            document: true,
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
            companyGroup: {
              select: {
                id: true,
                name: true,
                document: true,
              },
            },
          },
        })

        bases.forEach((base) => {
          if (!companyGroup) {
            companyGroup = base.companyGroup
          }

          organizations.push({
            id: base.id,
            name: base.name,
            document: base.document,
            kind: "BASE",
            parentCompany: {
              id: base.unit.id,
              name: base.unit.name,
              document: null,
            },
          })
        })
      }

      if (!companyGroup) {
        throw new ResourceNotFoundException("Company group not found")
      }

      return reply.status(200).send({
        companyGroup,
        organizations,
      })
    }
  )
}
