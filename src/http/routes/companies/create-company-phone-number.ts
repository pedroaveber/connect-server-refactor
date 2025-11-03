import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslCompany } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

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
          name: z.string().optional(),
          isWhatsapp: z.boolean().optional(),
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
      const authUser = getAuthUser(request)
      const { can } = defineAbilityFor(authUser)

      const { companyId } = request.params
      const { name, isWhatsapp, number } = request.body

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const caslCompany = getCaslCompany({
        companyId: company.id,
        companyGroupId: company.companyGroupId,
      })

      if (can("update", caslCompany) === false) {
        throw new ForbiddenException()
      }

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
          name,
          isWhatsapp,
        },
      })

      return reply.status(201).send({
        id: newPhone.id,
      })
    }
  )
}
