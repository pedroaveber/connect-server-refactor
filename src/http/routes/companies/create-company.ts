import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompany } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const createCompany: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Create company",
        operationId: "createCompany",
        security: [{ BearerAuth: [] }],
        description: "Create company",
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          companyGroupId: z.cuid().meta({
            description: "Company group ID",
          }),
          phones: z.array(
            z.object({
              name: z.string().optional(),
              isWhatsapp: z.boolean().optional(),
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
      const authUser = getAuthUser(request)
      const { document, name, phones, companyGroupId } = request.body

      const caslCompany = getCaslCompany({
        companyGroupId,
        companyId: "FAKE_CUID",
      })

      const { can } = defineAbilityFor(authUser)

      if (can("create", caslCompany) === false) {
        throw new ForbiddenException()
      }

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
