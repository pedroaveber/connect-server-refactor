import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const deleteUnitPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/units/:unitId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Delete unit phone number",
        operationId: "deleteUnitPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete unit phone number",
        params: z.object({
          unitId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { unitId, phoneId } = request.params

      const phone = await prisma.phone.findUnique({
        where: {
          id: phoneId,
          unitId,
        },
      })

      if (!phone) {
        throw new ResourceNotFoundException("Número de telefone não encontrado")
      }

      await prisma.phone.delete({
        where: {
          id: phoneId,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
