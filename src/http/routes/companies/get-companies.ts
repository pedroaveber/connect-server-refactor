import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { auth } from "@/http/hooks/auth"

export const getCompanies: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get companies",
        security: [{ BearerAuth: [] }],
        description: "Get companies",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          document: z.string().optional(),
          companyGroupId: z.cuid().optional().meta({
            description: "Filter by company group ID",
          }),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
                companyGroupId: z.cuid(),
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
      const { page, perPage, name, document, companyGroupId } = request.query

      const [companies, total] = await Promise.all([
        prisma.company.findMany({
          where: {
            name: {
              contains: name,
            },
            document: {
              contains: document,
            },
            companyGroupId,
            deletedAt: null,
          },
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            phones: true,
          },
        }),

        prisma.company.count({
          where: {
            name: {
              contains: name,
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
        data: companies,
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
