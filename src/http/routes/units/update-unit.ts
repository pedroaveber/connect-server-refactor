import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const updateUnit: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Update unit",
        security: [{ BearerAuth: [] }],
        description: "Update unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          totalVehiclesHired: z.number().int().min(0).meta({
            description: "Total of vehicles hired",
          }),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { unitId } = request.params
      const { document, name, totalVehiclesHired } = request.body

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      const hasChangedDocument = unit.document !== document

      if (hasChangedDocument) {
        const unitWithSameDocument = await prisma.unit.findFirst({
          where: {
            document,
            NOT: {
              id: unitId,
            },
          },
        })

        if (unitWithSameDocument) {
          throw new ConflictException(
            "Já existe uma unidade com este documento"
          )
        }
      }

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: {
          name,
          document,
          totalVehiclesHired,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
