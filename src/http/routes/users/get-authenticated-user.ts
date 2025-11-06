import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { roleSchema } from "@/auth/roles"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const getAuthenticatedUser: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users/me",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get authenticated user",
        security: [{ BearerAuth: [] }],
        operationId: "getAuthenticatedUser",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              document: z.string(),
              avatarUrl: z.string().nullable(),
              birthDate: z.date(),
              roles: z.array(roleSchema),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const userId = request.user.sub

      const { can } = defineAbilityFor(authUser)

      if (can("read", authUser) === false) {
        throw new ForbiddenException()
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          document: true,
          avatarUrl: true,
          birthDate: true,
          createdAt: true,
          roles: true,
        },
      })

      if (!user) {
        throw new ResourceNotFoundException("Usuário não encontrado")
      }

      return reply.status(200).send({
        data: user,
      })
    }
  )
}
