import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { BadRequestException } from "@/http/exceptions/bad-request-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { auth } from "@/http/hooks/auth"

export const deleteCompany: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Delete company",
        security: [{ BearerAuth: [] }],
        description: "Delete company",
        params: z.object({
          companyId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      })

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada")
      }

      if (company.deletedAt) {
        throw new BadRequestException("Empresa já deletada")
      }

      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send(null)
    }
  )
}
