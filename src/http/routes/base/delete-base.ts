import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslBase } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"

export const deleteBase: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/bases/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Delete base",
        operationId: "deleteBase",
        params: z.object({ id: z.cuid() }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { id } = request.params

      const { can } = defineAbilityFor(authUser)

      const base = await prisma.base.findUnique({ where: { id } })

      if (!base) {
        throw new ResourceNotFoundException("Base não encontrada.")
      }

      const caslBase = getCaslBase({
        baseId: base.id,
        unitId: base.unitId,
        companyId: base.companyId,
        companyGroupId: base.companyGroupId,
      })

      if (can("delete", caslBase) === false) {
        throw new ForbiddenException()
      }

      await prisma.base.update({
        where: { id },
        data: { deletedAt: new Date() },
      })

      return reply.status(204).send(null)
    }
  )
}
