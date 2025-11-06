import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslAmbulance } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const createAmbulance: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Create ambulance",
        operationId: "createAmbulance",
        security: [{ BearerAuth: [] }],
        body: z.object({
          name: z.string(),
          baseId: z.cuid(),
          licensePlate: z.string().meta({
            description: "License plate of the ambulance",
          }),
          observations: z.string().optional(),
        }),
        response: { 201: z.object({ id: z.cuid() }) },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { name, observations, licensePlate, baseId } = request.body

      const base = await prisma.base.findUnique({
        where: {
          id: baseId,
        },
      })

      if (!base) {
        throw new ResourceNotFoundException("Base not found")
      }

      const { can } = defineAbilityFor(authUser)

      const caslAmbulance = getCaslAmbulance({
        baseId: base.id,
        unitId: base.unitId,
        companyId: base.companyId,
        companyGroupId: base.companyGroupId,
      })

      if (can("create", caslAmbulance) === false) {
        throw new ForbiddenException()
      }

      const ambulanceWithSameLicensePlate = await prisma.ambulance.findUnique({
        where: {
          licensePlate,
        },
      })

      if (ambulanceWithSameLicensePlate) {
        throw new ConflictException(
          "Ambulance with same license plate already exists"
        )
      }

      const ambulance = await prisma.ambulance.create({
        data: {
          name,
          observations,
          licensePlate,
          baseId: base.id,
          unitId: base.unitId,
          companyId: base.companyId,
          companyGroupId: base.companyGroupId,
        },
      })

      return reply.status(201).send({ id: ambulance.id })
    }
  )
}
