import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteChat: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/chats/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Delete chat by ID",
        operationId: "deleteChat",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const chat = await prisma.chat.findUnique({ where: { id } });
      if (!chat) throw new ResourceNotFoundException("Chat não encontrado");

      await prisma.chat.delete({ where: { id } });

      return reply.status(204).send(null);
    }
  );
};
