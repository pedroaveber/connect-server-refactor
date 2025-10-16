import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createChatSchema = z.object({
  ambulanceId: z.string(),
});

export const createChat: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/chats",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Create a new chat",
        operationId: "createChat",
        security: [{ BearerAuth: [] }],
        body: createChatSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { ambulanceId } = request.body;

      const chat = await prisma.chat.create({
        data: { ambulanceId },
      });

      return reply.status(201).send({ id: chat.id });
    }
  );
};
