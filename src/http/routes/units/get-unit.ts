import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

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
              document: z.string().nullable(),
              companyId: z.cuid(),
              createdAt: z.string().pipe(z.coerce.date()),
              updatedAt: z.string().pipe(z.coerce.date()),
              deletedAt: z.string().pipe(z.coerce.date()).nullable(),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  createdAt: z.string().pipe(z.coerce.date()),
                  updatedAt: z.string().pipe(z.coerce.date()),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { unitId } = request.params

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
        include: {
          phones: true,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      return reply.status(200).send({
        data: unit,
      })
    }
  )
}
