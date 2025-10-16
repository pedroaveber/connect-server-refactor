import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const createCompanyPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/companies/:companyId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Create company phone number",
        operationId: "createCompanyPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create company phone number",
        params: z.object({
          companyId: z.cuid(),
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
      const { companyId } = request.params
      const { number } = request.body

      const phone = await prisma.phone.findFirst({
        where: {
          number,
          companyId,
        },
      })

      if (phone) {
        throw new ConflictException("Número de telefone já existe")
      }

      const newPhone = await prisma.phone.create({
        data: {
          number,
          companyId,
        },
      })

      return reply.status(201).send({
        id: newPhone.id,
      })
    }
  )
}
