import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser, getCaslCompanyGroup } from "@/http/helpers/casl"
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
        operationId: "createCompanyGroupPhoneNumber",
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
      const authUser = getAuthUser(request)

      const { companyGroupId } = request.params
      const { number } = request.body

      const { can } = defineAbilityFor(authUser)

      const caslCompanyGroup = getCaslCompanyGroup({ companyGroupId })

      if (can("update", caslCompanyGroup) === false) {
        throw new ForbiddenException()
      }

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
