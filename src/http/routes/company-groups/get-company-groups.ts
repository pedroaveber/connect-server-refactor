import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getCompanyGroups: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Get company groups",
        operationId: "getCompanyGroups",
        security: [{ BearerAuth: [] }],
        description: "Get company groups",
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
                invoiceMode: z.enum(["DISCRIMINATED", "GENERAL"]),
                companiesCount: z.number(),
                createdAt: z.date(),
                updatedAt: z.date(),
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
      const { page, perPage, name, document } = request.query

      const { can } = defineAbilityFor(authUser)

      if (can("list", "CompanyGroup") === false) {
        throw new ForbiddenException()
      }

      const [companyGroups, total] = await Promise.all([
        prisma.companyGroup.findMany({
          select: {
            id: true,
            name: true,
            document: true,
            invoiceMode: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                companies: true,
              },
            },
          },
          where: {
            name: {
              contains: name,
            },
            document: {
              contains: document,
            },
            deletedAt: null,
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.companyGroup.count({
          where: {
            name: {
              contains: name,
            },
            document: {
              contains: document,
            },
            deletedAt: null,
          },
        }),
      ])

      const totalPages = Math.ceil(total / perPage)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return reply.status(200).send({
        data: companyGroups.map((companyGroup) => ({
          ...companyGroup,
          companiesCount: companyGroup._count.companies,
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
