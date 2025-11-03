import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getBase: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get base",
        operationId: "getBase",
        security: [{ BearerAuth: [] }],
        description: "Get base",
        params: z.object({
          id: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              document: z.string().nullable(),
              latitude: z.number(),
              longitude: z.number(),
              createdAt: z.date(),
              updatedAt: z.date(),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  isWhatsapp: z.boolean(),
                  name: z.string().nullable(),
                  createdAt: z.date(),
                })
              ),
              unit: z.object({
                id: z.cuid(),
                name: z.string(),
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
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { id } = request.params

      const { can } = defineAbilityFor(authUser)

      const base = await prisma.base.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          latitude: true,
          document: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
          phones: {
            select: {
              id: true,
              number: true,
              isWhatsapp: true,
              name: true,
              createdAt: true,
            },
          },
          unit: {
            select: {
              id: true,
              name: true,
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
            },
          },
        },
      })

      if (!base) {
        throw new ResourceNotFoundException("Base not found")
      }

      const caslBase = getCaslBase({
        baseId: base.id,
        unitId: base.unit.id,
        companyId: base.unit.company.id,
        companyGroupId: base.unit.company.companyGroup.id,
      })

      if (can("read", caslBase) === false) {
        throw new ForbiddenException()
      }

      return reply.status(200).send({
        data: base,
      })
    }
  )
}
