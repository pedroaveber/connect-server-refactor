import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { MessageStatus, MessageType, Platform } from "@prisma/client";

export const getChatMessages: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/chat/messages/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary:
          "Get chat messages paginated (reverse order for infinite scroll)",
        operationId: "getChatMessages",
        security: [{ BearerAuth: [] }],
        params: z.object({
          id: z.string(),
        }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).max(100).default(20),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                chat: z.object({
                  id: z.string(),
                  ambulance: z.object({
                    unitId: z.string(),
                  }),
                }),
                chatId: z.string(),
                content: z.string().nullable(),
                file: z.string().nullable(),
                messageType: z.enum(MessageType),
                offlineId: z.string().optional().nullable(),
                createdAt: z.date(),
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
                status: z.enum(MessageStatus),
                isNew: z.boolean().optional(),
                platform: z.enum(Platform),
              })
            ),
            pagination: z.object({
              total: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
              currentPage: z.number(),
              perPage: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.chat.read,
      });

      const { id } = request.params;
      const { page, perPage } = request.query;

      // Validar se o chat existe e o usuário tem acesso
      const chat = await prisma.chats.findUnique({
        where: { id },
        select: { id: true },
      });

      if (!chat) {
        return;
      }

      // Contar total de mensagens
      const total = await prisma.messages.count({
        where: { chatId: id },
      });

      const totalPages = Math.ceil(total / perPage);

      // Validar página
      if (page > totalPages && totalPages > 0) {
        return;
      }

      // Calcular offset para paginação reversa
      // Página 1 = mensagens mais recentes
      // Página 2 = mensagens anteriores, etc.
      const offset = total - page * perPage;
      const skip = Math.max(0, offset);
      const take = offset < 0 ? perPage + offset : perPage;

      // Buscar mensagens em ordem crescente (mais antigas primeiro)
      // depois inverter no código para manter a lógica do infinite scroll
      const messages = await prisma.messages.findMany({
        select: {
          id: true,
          chat: {
            select: {
              id: true,
              ambulance: {
                select: {
                  unitId: true,
                },
              },
            },
          },
          chatId: true,
          content: true,
          file: true,
          messageType: true,
          createdAt: true,
          offlineId: true,
          platform: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
          status: true,
        },
        where: {
          chatId: id,
          // status: MessageStatus.SENT
        },
        orderBy: { createdAt: "asc" },
        skip,
        take,
      });

      // Reverter para mostrar as mais recentes no final
      // const reversedMessages = messages.reverse();

      return reply.status(200).send({
        data: messages,
        pagination: {
          total,
          totalPages,
          currentPage: page,
          perPage,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      });
    }
  );
};
