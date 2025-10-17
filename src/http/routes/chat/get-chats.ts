import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { Prisma } from "@prisma/client";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const chatQuerySchema = z
  .object({
    companyGroupId: z.string().optional(),
    companyId: z.string().optional(),
    unitId: z.string().optional(),
    baseId: z.string().optional(),
    ambulanceId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).default(10),
  })
  .refine(
    (data) => {
      const hierarchyFilters = [
        data.companyGroupId,
        data.companyId,
        data.unitId,
        data.baseId,
      ].filter(Boolean);
      return hierarchyFilters.length <= 1;
    },
    {
      message:
        "Você só pode passar um entre baseId, unitId, companyId ou companyGroupId",
      path: ["baseId", "unitId", "companyId", "companyGroupId"],
    }
  );

export const getChats: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/chats",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "List chats with last message and unread messages count",
        security: [{ BearerAuth: [] }],
        operationId: "getChats",
        querystring: chatQuerySchema,
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                ambulanceId: z.string(),
                unreadCount: z.number(),
                lastMessage: z
                  .object({
                    id: z.string(),
                    messageContent: z.string(),
                    messageType: z.string(),
                    messageFile: z.string().nullable(),
                    user: z.object({
                      id: z.string(),
                      name: z.string(),
                    }),
                    createdAt: z.date(),
                  })
                  .nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            ),
            pagination: z.object({
              total: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
              currentPage: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const {
        companyGroupId,
        companyId,
        unitId,
        baseId,
        ambulanceId,
        page,
        perPage,
      } = request.query;
      const userId = request.user.sub;

      const where: Prisma.ChatWhereInput = {};
      if (ambulanceId) where.ambulanceId = ambulanceId;
      if (baseId) where.ambulance = { ambulanceBaseId: baseId };
      if (unitId) where.ambulance = { ambulanceBase: { unitId } };
      if (companyId)
        where.ambulance = { ambulanceBase: { unit: { companyId } } };
      if (companyGroupId)
        where.ambulance = {
          ambulanceBase: { unit: { company: { companyGroupId } } },
        };

      const [chats, total] = await Promise.all([
        prisma.chat.findMany({
          where,
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            messages: {
              select: {
                id: true,
                messageContent: true,
                messageType: true,
                messageFile: true,
                createdAt: true,
                user: {
                  select: { id: true, name: true },
                },
                messageReadReceipt: {
                  select: { userId: true, readAt: true },
                },
              },
              orderBy: { createdAt: "desc" },
              take: 1, // pega apenas a última mensagem
            },
            _count: {
              select: {
                messages: {
                  where: {
                    NOT: { messageReadReceipt: { some: { userId } } },
                  },
                },
              },
            },
          },
        }),
        prisma.chat.count({ where }),
      ]);

      const chatsWithUnread = chats.map((chat) => {
        const lastMessage = chat.messages[0] || null;

        return {
          ...chat,
          unreadCount: chat._count.messages,
          lastMessage: lastMessage,
        };
      });

      // Ordena os chats pela última mensagem enviada (desc)
      chatsWithUnread.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt.getTime() ?? 0;
        const bTime = b.lastMessage?.createdAt.getTime() ?? 0;
        return bTime - aTime;
      });

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: chatsWithUnread,
        pagination: {
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
          currentPage: page,
        },
      });
    }
  );
};
