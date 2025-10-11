import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const getCompany: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get company",
        security: [{ BearerAuth: [] }],
        description: "Get company",
        params: z.object({
          companyId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.cuid(),
              name: z.string(),
              document: z.string(),
              totalVehiclesHired: z.number(),
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
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        include: {
          phones: true,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      return reply.status(200).send({
        data: company,
      })
    }
  )
}
