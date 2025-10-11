import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const createCompany: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Create company",
        security: [{ BearerAuth: [] }],
        description: "Create company",
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          totalVehiclesHired: z.number().int().min(0).meta({
            description: "Total of vehicles hired",
          }),
          companyGroupId: z.cuid().meta({
            description: "Company group ID",
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
      const { document, name, phones, totalVehiclesHired, companyGroupId } =
        request.body

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      const companyWithSameDocument = await prisma.company.findUnique({
        where: {
          document,
        },
      })

      if (companyWithSameDocument) {
        throw new ConflictException("Já existe uma empresa com este documento")
      }

      const company = await prisma.company.create({
        data: {
          document,
          name,
          totalVehiclesHired,
          companyGroupId,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      })

      return reply.status(201).send({
        id: company.id,
      })
    }
  )
}
