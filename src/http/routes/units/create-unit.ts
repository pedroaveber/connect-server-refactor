import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const createUnit: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/units",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Create unit",
        operationId: "createUnit",
        security: [{ BearerAuth: [] }],
        description: "Create unit",
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }).optional(),
          companyId: z.cuid().meta({
            description: "Company ID",
          }),
          phones: z.array(
            z.object({
              number: z.string().meta({
                description: "Brazilian phone number (example: +5511999999999)",
              }),
            })
          ).optional(),
        }),
        response: {
          201: z.object({
            id: z.cuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { document, name, phones, companyId } = request.body

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      if(document) {
        const unitWithSameDocument = await prisma.unit.findUnique({
        where: {
          document,
        },
      })

      if (unitWithSameDocument) {
        throw new ConflictException("Já existe uma unidade com este documento")
      }
      }

      const unit = await prisma.unit.create({
        data: {
          document,
          name,
          companyId,
          ...(phones && phones.length > 0
            ? {
                phones: {
                  createMany: { data: phones },
                },
              }
            : {}),
        },
      })

      return reply.status(201).send({
        id: unit.id,
      })
    }
  )
}
