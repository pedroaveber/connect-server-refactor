import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"
import { zodAmbulanceStatusEnum } from "@/utils/zod"

export const getAmbulancesFromBase: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases/:baseId/ambulances",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get ambulances from base",
        operationId: "getAmbulancesFromBase",
        security: [{ BearerAuth: [] }],
        description: "Get ambulances from base",
        params: z.object({
          baseId: z.cuid(),
        }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          licensePlate: z.string().optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.cuid(),
                name: z.string(),
                status: zodAmbulanceStatusEnum,
                licensePlate: z.string(),
                observations: z.string().nullable(),
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

      const { baseId } = request.params
      const { page, perPage, name, licensePlate } = request.query

      const base = await prisma.base.findUnique({
        where: {
          id: baseId,
        },
      })

      if (!base) {
        throw new ResourceNotFoundException("Base não encontrada")
      }

      const caslBase = getCaslBase({
        baseId: base.id,
        unitId: base.unitId,
        companyId: base.companyId,
        companyGroupId: base.companyGroupId,
      })

      if (can("listAmbulances", caslBase) === false) {
        throw new ForbiddenException()
      }

      const [ambulances, total] = await Promise.all([
        prisma.ambulance.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            licensePlate: true,
            observations: true,
            createdAt: true,
            updatedAt: true,
          },
          where: {
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            ...(licensePlate && {
              licensePlate: { contains: licensePlate, mode: "insensitive" },
            }),
            baseId,
            deletedAt: null,
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.ambulance.count({
          where: {
            ...(name && { name: { contains: name, mode: "insensitive" } }),
            ...(licensePlate && {
              licensePlate: { contains: licensePlate, mode: "insensitive" },
            }),
            baseId,
            deletedAt: null,
          },
        }),
      ])

      const totalPages = Math.ceil(total / perPage)
      const hasNextPage = page < totalPages
      const hasPreviousPage = page > 1

      return reply.status(200).send({
        data: ambulances,
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
