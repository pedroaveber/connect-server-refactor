import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const createBase: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Create a new base",
        operationId: "createBase",
        body: z.object({
          name: z.string(),
          document: z.string().optional(),
          latitude: z.number().min(-90).max(90),
          longitude: z.number().min(-180).max(180),
          unitId: z.string(),
          phones: z.array(
            z.object({
              number: z.string(),
              name: z.string().optional(),
              isWhatsapp: z.boolean().optional(),
            })
          ),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { name, document, unitId, phones, latitude, longitude } =
        request.body

      const { can } = defineAbilityFor(authUser)

      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
      })

      if (!unit) {
        throw new ResourceNotFoundException("Unit not found")
      }

      const caslBase = getCaslBase({
        baseId: "FAKE_CUID",
        unitId: unit.id,
        companyId: unit.companyId,
        companyGroupId: unit.companyGroupId,
      })

      if (can("create", caslBase) === false) {
        throw new ForbiddenException()
      }

      if (document) {
        const baseWithSameDocument = await prisma.base.findUnique({
          where: { document },
        })

        if (baseWithSameDocument) {
          throw new ConflictException("Base with same document already exists")
        }
      }

      const base = await prisma.base.create({
        data: {
          name,
          unitId,
          document,
          latitude,
          longitude,
          companyId: unit.companyId,
          companyGroupId: unit.companyGroupId,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      })

      return reply.status(201).send({ id: base.id })
    }
  )
}
