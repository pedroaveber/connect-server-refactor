import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslUnit } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

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
          companyId: z.cuid().meta({
            description: "Company ID",
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
      const { name, companyId } = request.body

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      const caslUnit = getCaslUnit({
        companyGroupId: company.companyGroupId,
        companyId,
        unitId: "FAKE_CUID",
      })

      const { can } = defineAbilityFor(authUser)

      if (can("create", caslUnit) === false) {
        throw new ForbiddenException()
      }

      const unit = await prisma.unit.create({
        data: {
          name,
          companyGroupId: company.companyGroupId,
          companyId: company.id,
        },
      })

      return reply.status(201).send({
        id: unit.id,
      })
    }
  )
}
