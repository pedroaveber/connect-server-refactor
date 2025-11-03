import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteBasePhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/bases/:baseId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Delete base phone number",
        operationId: "deleteBasePhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete a phone number from a base",
        params: z.object({
          baseId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { baseId, phoneId } = request.params

      const { can } = defineAbilityFor(authUser)

      const base = await prisma.base.findUnique({
        where: {
          id: baseId,
        },
      })

      if (!base) {
        throw new ResourceNotFoundException("Base not found")
      }

      const caslBase = getCaslBase({
        baseId: base.id,
        unitId: base.unitId,
        companyId: base.companyId,
        companyGroupId: base.companyGroupId,
      })

      if (can("update", caslBase) === false) {
        throw new ForbiddenException()
      }

      await prisma.phone.delete({
        where: {
          id: phoneId,
          baseId: base.id,
        },
      })

      return reply.status(204).send(null)
    }
  )
}
