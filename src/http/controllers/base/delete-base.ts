import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

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
      await request.authorize({
        permission: permissions.base.delete,
        target: { baseId: request.params.id },
      });

      const { id } = request.params;

      await prisma.base.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return reply.status(204).send(null);
    }
  );
};
