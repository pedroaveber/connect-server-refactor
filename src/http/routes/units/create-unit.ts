import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const createUnit: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/units",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Create unit",
        security: [{ BearerAuth: [] }],
        description: "Create unit",
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          totalVehiclesHired: z.number().int().min(0).meta({
            description: "Total of vehicles hired",
          }),
          companyId: z.cuid().meta({
            description: "Company ID",
          }),
          phones: z.array(
            z.object({
              number: z.string().meta({
                description: "Brazilian phone number (example: +5511999999999)",
              }),
            })
          ),
        }),
        response: {
          201: z.object({
            id: z.cuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { document, name, phones, totalVehiclesHired, companyId } =
        request.body

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const unitWithSameDocument = await prisma.unit.findUnique({
        where: {
          document,
        },
      })

      if (unitWithSameDocument) {
        throw new ConflictException("Já existe uma unidade com este documento")
      }

      const unit = await prisma.unit.create({
        data: {
          document,
          name,
          totalVehiclesHired,
          companyId,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      })

      return reply.status(201).send({
        id: unit.id,
      })
    }
  )
}
