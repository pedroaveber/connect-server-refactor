import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";

export const deleteChat: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/chats/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Delete a chat",
        operationId: "deleteChat",
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          baseId: z.string(),
        }),
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      await request.authorize({
        permission: permissions.chat.delete,
        target: { baseId: request.body.baseId },
      });

      const response = await prisma.chats.delete({
        where: { id: request.params.id },
      });

      return reply.status(200).send({ id: response.id });
    }
  );
};
