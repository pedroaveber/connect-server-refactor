import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getUnreadChatMessages: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/chat/unread/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Get unread chat messages",
        operationId: "getUnreadChatMessages",
        security: [{ BearerAuth: [] }],
        description: "Get unread chat messages",
        params: z.object({
          id: z.string(),
        }),
        querystring: z.object({
          unitId: z.string(),
        }),
        response: {
          200: z.object({
            data: z
              .object({
                id: z.string(),
                lastMessageAt: z.date().nullable(),
                unreadCountApp: z.number(),
                unreadCountWeb: z.number(),
              })
              .nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.chat.read,
        target: {
          unitId: request.query.unitId,
        },
      });
      const { id } = request.params;

      const chat = await prisma.chats.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          lastMessageAt: true,
          unreadCountApp: true,
          unreadCountWeb: true,
        },
      });

      return reply.status(200).send({
        data: chat,
      });
    }
  );
};
