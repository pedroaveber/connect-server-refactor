import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUnit } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getUnit: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Get unit",
        operationId: "getUnit",
        security: [{ BearerAuth: [] }],
        description: "Get unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.cuid(),
              name: z.string(),
              basesCount: z.number(),
              createdAt: z.date(),
              updatedAt: z.date(),
              company: z.object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
                companyGroup: z.object({
                  id: z.cuid(),
                  name: z.string(),
                  document: z.string(),
                }),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { unitId } = request.params

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          company: {
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
          },
          _count: {
            select: {
              bases: true,
            },
          },
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      const { can } = defineAbilityFor(authUser)

      const caslUnit = getCaslUnit({
        unitId: unit.id,
        companyId: unit.company.id,
        companyGroupId: unit.company.companyGroup.id,
      })

      if (can("read", caslUnit) === false) {
        throw new ForbiddenException()
      }

      return reply.status(200).send({
        data: {
          ...unit,
          basesCount: unit._count.bases,
        },
      })
    }
  )
}
