import { prisma } from "@/database/prisma"
import { BadRequestException } from "@/http/exceptions/bad-request-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const deleteUnit: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Delete unit",
        operationId: "deleteUnit",
        security: [{ BearerAuth: [] }],
        description: "Delete unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { unitId } = request.params

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada")
      }

      if (unit.deletedAt) {
        throw new BadRequestException("Unidade já deletada")
      }

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send(null)
    }
  )
}
