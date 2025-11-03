import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const createBasePhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/bases/:baseId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Create base phone number",
        operationId: "createBasePhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create a phone number for a base",
        params: z.object({
          baseId: z.cuid(),
        }),
        body: z.object({
          isWhatsapp: z.boolean().default(false),
          name: z.string().optional(),
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
      const { baseId } = request.params
      const { number, isWhatsapp, name } = request.body

      const { can } = defineAbilityFor(authUser)

      const base = await prisma.base.findUnique({
        where: {
          id: baseId,
        },
      })

      if (!base) {
        throw new ResourceNotFoundException("Base not found")
      }

      const caslBase = getCaslBase({
        baseId: base.id,
        unitId: base.unitId,
        companyId: base.companyId,
        companyGroupId: base.companyGroupId,
      })

      if (can("update", caslBase) === false) {
        throw new ForbiddenException()
      }

      const phone = await prisma.phone.findFirst({
        where: {
          number,
          baseId,
        },
      })

      if (phone) {
        throw new ConflictException("Número de telefone já existe")
      }

      const newPhone = await prisma.phone.create({
        data: {
          name,
          baseId,
          number,
          isWhatsapp,
        },
      })

      return reply.status(201).send({
        id: newPhone.id,
      })
    }
  )
}
