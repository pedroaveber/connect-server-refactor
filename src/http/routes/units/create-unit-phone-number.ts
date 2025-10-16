import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const createUnitPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/units/:unitId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Create unit phone number",
        operationId: "createUnitPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create unit phone number",
        params: z.object({
          unitId: z.cuid(),
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
      const { unitId } = request.params
      const { number } = request.body

      const phone = await prisma.phone.findFirst({
        where: {
          number,
          unitId,
        },
      })

      if (phone) {
        throw new ConflictException("Número de telefone já existe")
      }

      const newPhone = await prisma.phone.create({
        data: {
          number,
          unitId,
        },
      })

      return reply.status(201).send({
        id: newPhone.id,
      })
    }
  )
}
