import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const createMessage: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/messages",
    {
      preHandler: [auth],
      schema: {
        tags: ["Messages"],
        summary: "Create a new message in a chat",
        operationId: "createMessage",
        security: [{ BearerAuth: [] }],
        body: z.object({
          chatId: z.string(),
          messageContent: z.string().min(1, "A mensagem não pode ser vazia"),
          messageType: z
            .enum([
              "TEXT",
              "AUDIO",
              "IMAGE",
              "DOCUMENT",
              "IMAGE_TEXT",
              "DOCUMENT_TEXT",
              "VIDEO",
              "VIDEO_TEXT",
            ])
            .default("TEXT"),
          messageFile: z.string().optional(),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { chatId } = request.body;
      const userId = request.user.sub;

      const chat = await prisma.chat.findUnique({ where: { id: chatId } });
      if (!chat) throw new ResourceNotFoundException("Chat não encontrado");

      const message = await prisma.messages.create({
        select: {
          id: true,
        },
        data: {
          ...request.body,
          userId,
        },
      });

      return reply.status(201).send(message);
    }
  );
};
