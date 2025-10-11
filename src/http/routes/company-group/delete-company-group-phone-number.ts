import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const deleteCompanyGroupPhoneNumber: FastifyPluginCallbackZod = (
  app
) => {
  app.delete(
    "/company-groups/:companyGroupId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Delete company group phone number",
        security: [{ BearerAuth: [] }],
        description: "Delete company group phone number",
        params: z.object({
          companyGroupId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyGroupId, phoneId } = request.params

      const phone = await prisma.phone.findUnique({
        where: {
          id: phoneId,
          companyGroupId,
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
