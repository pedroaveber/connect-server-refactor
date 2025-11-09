import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteUnit: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Delete unit",
        operationId: "deleteUnit",
        security: [{ BearerAuth: [] }],
        description: "Delete unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.unit.delete,
        target: {
          unitId: request.params.unitId,
        },
      });

      const { unitId } = request.params;

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: { deletedAt: new Date() },
      });

      return reply.status(204).send(null);
    }
  );
};
