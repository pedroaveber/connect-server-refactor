import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { auth } from "@/http/hooks/auth"

export const createCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/company-groups",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Create company group",
        security: [{ BearerAuth: [] }],
        description: "Create company group",
        body: z.object({
          name: z.string(),
          document: z.string().length(11).meta({
            description: "Brazilian CNPJ",
          }),
          totalVehiclesHired: z.number().int().min(0).meta({
            description: "Total of vehicles hired",
          }),
          phones: z.array(
            z.object({
              number: z.string().length(11).meta({
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
      const { document, name, phones, totalVehiclesHired } = request.body

      const companyGroupWithSameDocument = await prisma.companyGroup.findUnique(
        {
          where: {
            document,
          },
        }
      )

      if (companyGroupWithSameDocument) {
        throw new ConflictException(
          "Já existe um grupo empresarial com este documento"
        )
      }

      const companyGroup = await prisma.companyGroup.create({
        data: {
          document,
          name,
          totalVehiclesHired,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      })

      return reply.status(201).send({
        id: companyGroup.id,
      })
    }
  )
}
