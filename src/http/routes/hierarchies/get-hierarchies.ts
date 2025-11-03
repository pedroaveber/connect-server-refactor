import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const getHierarchies: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/hierarchies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Hierarchy"],
        summary: "Get hierarchies",
        operationId: "getHierarchies",
        security: [{ BearerAuth: [] }],
        description: "Get hierarchies",
        response: {
          200: z.object({
            isAdmin: z.boolean(),
            isCompanyGroupAdmin: z.boolean(),
            redirectUri: z.string().nullable(),
            data: z.array(
              z.object({
                id: z.cuid(),
                name: z.string(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { roles, companyGroupId } = request.user

      const isAdmin = roles.includes("ADMIN")
      const isCompanyGroupAdmin = roles.includes("COMPANY_GROUP_ADMIN")

      if (isAdmin === true) {
        return reply.status(200).send({
          isAdmin: true,
          isCompanyGroupAdmin: false,
          redirectUri: null,
          data: [],
        })
      }

      if (isCompanyGroupAdmin === true) {
        const companyGroup = await prisma.companyGroup.findUnique({
          select: {
            id: true,
            name: true,
          },
          where: {
            id: companyGroupId,
          },
        })

        if (!companyGroup) {
          throw new ResourceNotFoundException("Company group not found")
        }

        return reply.status(200).send({
          isAdmin: false,
          isCompanyGroupAdmin: true,
          redirectUri: null,
          data: [companyGroup],
        })
      }

      throw new ForbiddenException()
    }
  )
}
