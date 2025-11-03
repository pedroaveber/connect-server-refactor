import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getCompaniesFromCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups/:companyGroupId/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get companies from company group",
        operationId: "getCompaniesFromCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Get companies from company group",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          document: z.string().optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
                createdAt: z.date(),
                updatedAt: z.date(),
                unitsCount: z.number(),
              })
            ),
            pagination: z.object({
              total: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
              currentPage: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { companyGroupId } = request.params
      const { page, perPage, name, document } = request.query

      const { can } = defineAbilityFor(authUser)

      if (can("listCompanies", "CompanyGroup") === false) {
        throw new ForbiddenException()
      }

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          select: {
            id: true,
            name: true,
            document: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                units: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            document: {
              contains: document,
            },
            companyGroupId,
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.company.count({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            document: {
              contains: document,
            },
            companyGroupId,
            deletedAt: null,
          },
        }),
      ])

      const totalPages = Math.ceil(total / perPage)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return reply.status(200).send({
        data: companies.map((company) => ({
          ...company,
          unitsCount: company._count.units,
        })),
        pagination: {
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
          currentPage: page,
        },
      })
    }
  )
}
