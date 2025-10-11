import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { auth } from "@/http/hooks/auth"

export const createCompanyGroupPhoneNumber: FastifyPluginCallbackZod = (
  app
) => {
  app.post(
    "/company-groups/:companyGroupId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Create company group phone number",
        security: [{ BearerAuth: [] }],
        description: "Create company group phone number",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        body: z.object({
          number: z.string().meta({
            description: "Brazilian phone number (example: +5511999999999)",
          }),
        }),
        response: {
          201: z.object({
            id: z.cuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { companyGroupId } = request.params
      const { number } = request.body

      const phone = await prisma.phone.findFirst({
        where: {
          number,
          companyGroupId,
        },
      })

      if (phone) {
        throw new ConflictException("Número de telefone já existe")
      }

      const newPhone = await prisma.phone.create({
        data: {
          number,
          companyGroupId,
        },
      })

      return reply.status(201).send({
        id: newPhone.id,
      })
    }
  )
}
