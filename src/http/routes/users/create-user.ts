import { hash } from "argon2"
import dayjs from "dayjs"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser, getCaslUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"
import { zodRolesEnum } from "@/utils/zod"

export const createUser: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/users",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Create user",
        operationId: "createUser",
        body: z.object({
          name: z.string(),
          document: z.string(),
          birthDate: z.string(),
          roles: z.array(zodRolesEnum),
          companyGroupId: z.cuid().optional(),
          companiesIds: z.array(z.cuid()).optional(),
          unitsIds: z.array(z.cuid()).optional(),
          basesIds: z.array(z.cuid()).optional(),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { can } = defineAbilityFor(authUser)

      const {
        name,
        document,
        birthDate,
        roles,
        basesIds,
        companiesIds,
        companyGroupId,
        unitsIds,
      } = request.body

      const caslUser = getCaslUser({
        associatedCompanyGroupId: authUser.associatedCompanyGroupId,
        roles,
        userId: "FAKE_CUID",
      })

      if (can("create", caslUser) === false) {
        throw new ForbiddenException()
      }

      const userWithSameDocument = await prisma.user.findUnique({
        where: {
          document,
        },
      })

      if (userWithSameDocument) {
        throw new ConflictException("Usuário já existe")
      }

      const password = await hash(dayjs(birthDate).format("DDMMYYYY"))

      const user = await prisma.user.create({
        data: {
          name,
          roles,
          document,
          password,
          birthDate: new Date(birthDate),
          associatedCompanyGroupId: request.user.associatedCompanyGroupId,
          organizations: {
            createMany: {
              data: [
                ...(companyGroupId ? [{ companyGroupId }] : []),
                ...(companiesIds
                  ? companiesIds.map((companyId) => ({ companyId }))
                  : []),
                ...(unitsIds ? unitsIds.map((unitId) => ({ unitId })) : []),
                ...(basesIds ? basesIds.map((baseId) => ({ baseId })) : []),
              ],
            },
          },
        },
      })

      return reply.status(201).send({ id: user.id })
    }
  )
}
