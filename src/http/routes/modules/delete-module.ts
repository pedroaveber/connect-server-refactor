import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteModule: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/modules/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Delete a module",
        operationId: "deleteModule",
        params: z.object({ id: z.cuid() }),
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const module = await prisma.module.findUnique({ where: { id } });
      if (!module) throw new ResourceNotFoundException("Module not found");

      await prisma.module.delete({ where: { id } });
      return reply.status(200).send({ id });
    }
  );
};
