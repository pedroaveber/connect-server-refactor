import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompany } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getUnitsFromCompany: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies/:companyId/units",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get units from company",
        operationId: "getUnitsFromCompany",
        security: [{ BearerAuth: [] }],
        description: "Get units from company",
        params: z.object({
          companyId: z.cuid(),
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
                createdAt: z.date(),
                updatedAt: z.date(),
                basesCount: z.number(),
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
      const { can } = defineAbilityFor(authUser)

      const { companyId } = request.params
      const { page, perPage, name } = request.query

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const caslCompany = getCaslCompany({
        companyId: company.id,
        companyGroupId: company.companyGroupId,
      })

      if (can("listUnits", caslCompany) === false) {
        throw new ForbiddenException()
      }

      const [units, total] = await Promise.all([
        prisma.unit.findMany({
          select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                bases: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          where: {
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            companyId,
            deletedAt: null,
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.unit.count({
          where: {
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            companyId,
            deletedAt: null,
          },
        }),
      ])

      const totalPages = Math.ceil(total / perPage)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return reply.status(200).send({
        data: units.map((unit) => ({
          ...unit,
          basesCount: unit._count.bases,
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
