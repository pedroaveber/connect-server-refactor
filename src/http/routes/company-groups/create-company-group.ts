import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const createCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/company-groups",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Create company group",
        operationId: "createCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Create company group",
        body: z.object({
          name: z.string(),
          invoiceMode: z.enum(["DISCRIMINATED", "GENERAL"]),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          phones: z.array(
            z.object({
              isWhatsapp: z.boolean().optional().default(false),
              name: z.string().optional(),
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
      const { document, name, phones, invoiceMode } = request.body

      const { can } = defineAbilityFor(authUser)

      if (can("create", "CompanyGroup") === false) {
        throw new ForbiddenException()
      }

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
          invoiceMode,
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
