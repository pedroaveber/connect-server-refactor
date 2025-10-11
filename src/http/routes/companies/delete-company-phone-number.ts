import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const deleteCompanyPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/companies/:companyId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Delete company phone number",
        security: [{ BearerAuth: [] }],
        description: "Delete company phone number",
        params: z.object({
          companyId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyId, phoneId } = request.params

      const phone = await prisma.phone.findUnique({
        where: {
          id: phoneId,
          companyId,
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
