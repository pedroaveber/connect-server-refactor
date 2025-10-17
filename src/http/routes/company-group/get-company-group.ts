import { prisma } from "@/database/prisma"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const getCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Get company group",
        operationId: "getCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Get company group",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.cuid(),
              name: z.string(),
              document: z.string(),
              createdAt: z.string().pipe(z.coerce.date()),
              updatedAt: z.string().pipe(z.coerce.date()),
              deletedAt: z.string().pipe(z.coerce.date()).nullable(),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  createdAt: z.string().pipe(z.coerce.date()),
                  updatedAt: z.string().pipe(z.coerce.date()),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { companyGroupId } = request.params

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
        include: {
          phones: true,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      return reply.status(200).send({
        data: companyGroup,
      })
    }
  )
}
