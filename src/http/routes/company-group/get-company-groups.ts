import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { auth } from "@/http/hooks/auth"

export const getCompanyGroups: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Get company groups",
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
                totalVehiclesHired: z.number(),
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
      const { page, perPage, name, document } = request.query

      const [companyGroups, total] = await Promise.all([
        prisma.companyGroup.findMany({
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
          include: {
            phones: true,
          },
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
        data: companyGroups,
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
