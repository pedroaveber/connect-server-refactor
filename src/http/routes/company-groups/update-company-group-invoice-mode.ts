import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const updateCompanyGroupInvoiceMode: FastifyPluginCallbackZod = (
  app
) => {
  app.patch(
    "/company-groups/:companyGroupId/invoice-mode",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Update company group invoice mode",
        operationId: "updateCompanyGroupInvoiceMode",
        security: [{ BearerAuth: [] }],
        description: "Update company group invoice mode",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        body: z.object({
          invoiceMode: z.enum(["DISCRIMINATED", "GENERAL"]),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { companyGroupId } = request.params
      const { invoiceMode } = request.body

      const { can } = defineAbilityFor(authUser)

      if (can("update", "CompanyGroup") === false) {
        throw new ForbiddenException()
      }

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
      })

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado")
      }

      await prisma.companyGroup.update({
        where: {
          id: companyGroupId,
        },
        data: {
          invoiceMode,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
