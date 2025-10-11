import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { ConflictException } from "@/http/exceptions/conflict-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const updateCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Update company group",
        security: [{ BearerAuth: [] }],
        description: "Update company group",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          totalVehiclesHired: z.number().int().min(0).meta({
            description: "Total of vehicles hired",
          }),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyGroupId } = request.params
      const { document, name, totalVehiclesHired } = request.body

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      const hasChangedDocument = companyGroup.document !== document

      if (hasChangedDocument) {
        const companyGroupWithSameDocument =
          await prisma.companyGroup.findFirst({
            where: {
              document,
              NOT: {
                id: companyGroupId,
              },
            },
          })

        if (companyGroupWithSameDocument) {
          throw new ConflictException(
            "Já existe um grupo empresarial com este documento"
          )
        }
      }

      await prisma.companyGroup.update({
        where: {
          id: companyGroupId,
        },
        data: {
          name,
          document,
          totalVehiclesHired,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
