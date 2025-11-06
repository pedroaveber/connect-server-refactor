import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser, getCaslCompanyGroup } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getBases: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get bases",
        operationId: "getBases",
        security: [{ BearerAuth: [] }],
        description: "Get bases",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          unitId: z.cuid().optional(),
          companyGroupId: z.cuid().optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.cuid(),
                name: z.string(),
                unit: z.object({
                  id: z.cuid(),
                  name: z.string(),
                }),
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

      const { page, perPage, name, companyGroupId } = request.query
      const companyGroupIdToUse =
        companyGroupId || authUser.associatedCompanyGroupId || "NOT_INFORMED"

      const { can } = defineAbilityFor(authUser)

      const caslCompanyGroup = getCaslCompanyGroup({
        companyGroupId: companyGroupIdToUse,
      })

      if (can("listBases", caslCompanyGroup) === false) {
        throw new ForbiddenException()
      }

      const [bases, total] = await Promise.all([
        prisma.base.findMany({
          select: {
            id: true,
            name: true,
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          where: {
            name: {
              contains: name,
              mode: "insensitive",
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

        prisma.base.count({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
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
        data: bases,
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
