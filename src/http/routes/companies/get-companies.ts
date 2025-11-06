import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser, getCaslCompanyGroup } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getCompanies: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get companies",
        operationId: "getCompanies",
        security: [{ BearerAuth: [] }],
        description: "Get companies",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          document: z.string().optional(),
          companyGroupId: z.cuid().optional(),
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

      const { page, perPage, name, document, companyGroupId } = request.query

      const companyGroupIdToUse =
        companyGroupId || authUser.associatedCompanyGroupId

      const { can } = defineAbilityFor(authUser)

      const caslCompanyGroup = getCaslCompanyGroup({
        companyGroupId: companyGroupIdToUse || "NOT_INFORMED",
      })

      if (can("listCompanies", caslCompanyGroup) === false) {
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
            ...(companyGroupIdToUse && { companyGroupId: companyGroupIdToUse }),
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
            ...(companyGroupIdToUse && { companyGroupId: companyGroupIdToUse }),
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
