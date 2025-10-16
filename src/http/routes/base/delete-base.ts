import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

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
      const { id } = request.params;

      const base = await prisma.base.findUnique({ where: { id } });
      if (!base) throw new ResourceNotFoundException("Base não encontrada.");

      await prisma.base.delete({ where: { id } });

      return reply.status(204).send();
    }
  );
};
