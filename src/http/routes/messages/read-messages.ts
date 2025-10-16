import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const readMessages: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/chats/:chatId/read",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Mark chat messages as read",
        operationId: "readMessages",
        security: [{ BearerAuth: [] }],
        params: z.object({
          chatId: z.string(),
        }),
        body: z
          .object({
            messageIds: z.array(z.string()).optional(),
          })
          .optional(),
        response: {
          200: z.object({
            markedCount: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { chatId } = request.params;
      const userId = request.user.sub;
      const messageIds = request.body?.messageIds;

      // Verifica se o chat existe
      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
        select: { id: true },
      });
      if (!chat) throw new ResourceNotFoundException("Chat não encontrado");

      // Busca mensagens não lidas (ou as passadas no body)
      const messagesToMark = await prisma.messages.findMany({
        where: {
          chatId,
          id: messageIds ? { in: messageIds } : undefined,
          messageReadReceipt: {
            none: { userId },
          },
        },
        select: { id: true },
      });

      if (!messagesToMark.length) {
        return reply.status(200).send({ markedCount: 0 });
      }

      // Marca como lidas (cria registros)
      await prisma.messageReadReceipt.createMany({
        data: messagesToMark.map((m) => ({
          messageId: m.id,
          userId,
          readAt: new Date(),
        })),
        skipDuplicates: true,
      });

      return reply.status(200).send({ markedCount: messagesToMark.length });
    }
  );
};
