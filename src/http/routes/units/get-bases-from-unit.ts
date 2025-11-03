import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUnit } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getBasesFromUnit: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/units/:unitId/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Get bases from unit",
        operationId: "getBasesFromUnit",
        security: [{ BearerAuth: [] }],
        description: "Get bases from unit",
        params: z.object({
          unitId: z.cuid(),
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
                document: z.string().nullable(),
                latitude: z.number(),
                longitude: z.number(),
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
      const { can } = defineAbilityFor(authUser)

      const { unitId } = request.params
      const { page, perPage, name, document } = request.query

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      const caslUnit = getCaslUnit({
        companyId: unit.companyId,
        unitId: unit.id,
        companyGroupId: unit.companyGroupId,
      })

      if (can("listBases", caslUnit) === false) {
        throw new ForbiddenException()
      }

      const [bases, total] = await Promise.all([
        prisma.base.findMany({
          select: {
            id: true,
            name: true,
            document: true,
            latitude: true,
            longitude: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            unitId,
            ...(document && {
              document: { contains: document },
            }),
            deletedAt: null,
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.base.count({
          where: {
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            unitId,
            ...(document && {
              document: { contains: document },
            }),
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
