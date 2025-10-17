import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const findMessagesByChat: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/messages/:chatId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Messages"],
        summary: "List messages by chat with pagination",
        operationId: "findMessagesByChat",
        security: [{ BearerAuth: [] }],
        params: z.object({
          chatId: z.string(),
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
              chatId: z.string(),
              messageContent: z.string(),
              messageType: z.string(),
              messageFile: z.string().nullable(),
              user: z.object({
                id: z.string(),
                name: z.string(),
                avatarUrl: z.string().nullable(),
              }),
              messageReadReceipt: z.array(
                z.object({
                  userId: z.string(),
                  readAt: z.string().pipe(z.coerce.date()),
                })
              ),
              createdAt: z.string().pipe(z.coerce.date()),
              updatedAt: z.string().pipe(z.coerce.date()),
            })
          ),
          pagination: z.object({
            total: z.number(),
            totalPages: z.number(),
            hasNextPage: z.boolean(),
            hasPreviousPage: z.boolean(),
            currentPage: z.number(),
          }),
        })
        },
      },
    },
    async (request, reply) => {
      const { chatId } = request.params;
      const { page, perPage } = request.query;

      const chat = await prisma.chat.findUnique({
        where: { id: chatId },
      });
      if (!chat) throw new ResourceNotFoundException("Chat não encontrado");

      const [messages, total] = await Promise.all([
        prisma.messages.findMany({
          where: { chatId },
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true },
            },
            messageReadReceipt: {
              select: { userId: true, readAt: true },
            },
          },
        }),
        prisma.messages.count({ where: { chatId } }),
      ]);

      const totalPages = Math.ceil(total / perPage);

      return reply.status(200).send({
        data: messages,
        pagination: {
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          currentPage: page,
        },
      });
    }
  );
};
