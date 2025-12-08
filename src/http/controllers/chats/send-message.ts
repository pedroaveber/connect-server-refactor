import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { MessageType, Platform } from "@prisma/client";
import { ably } from "@/utils/ably";

export const sendMessage: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/chats/message/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Send a message in a chat",
        operationId: "sendMessage",
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          content: z.string(),
          file: z.string().optional(),
          messageType: z.enum(MessageType),
          user: z.object({
            id: z.string(),
            name: z.string(),
            avatarUrl: z.string().nullable(),
          }),
          platform: z.enum(Platform),
          offlineId: z.string().optional(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            chatId: z.string(),
            content: z.string(),
            file: z.string().nullable().optional(),
            messageType: z.enum(MessageType),
            user: z.object({
              id: z.string(),
              name: z.string(),
              avatarUrl: z.string().nullable(),
            }),
            platform: z.enum(Platform),
            offlineId: z.string().optional(),
            createdAt: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { content, file, messageType, user, platform, offlineId } =
        request.body;

      const chat = await prisma.chats.findUnique({
        where: {
          id: request.params.id,
        },
        select: {
          ambulance: {
            select: {
              unitId: true,
              companyGroupId: true,
            },
          },
        },
      });

      if (!chat) {
        return;
      }

      await request.authorize({
        permission: permissions.chat.sendMessage,
        target: { unitId: chat?.ambulance.unitId },
      });

      const response = await prisma.messages.create({
        data: {
          chat: { connect: { id: request.params.id } },
          content,
          file,
          messageType,
          user: { connect: { id: user.id } },
          platform,
        },
      });

      const channel = ably.channels.get(
        `connect-${chat?.ambulance.companyGroupId}`
      );

      channel.publish("messages", {
        id: response.id,
        chat: {
          ambulance: {
            unitId: chat.ambulance.unitId,
          },
        },
        chatId: request.params.id,
        content,
        file,
        messageType,
        user,
        platform,
        createdAt: response.createdAt,
      });

      return reply.status(201).send({
        id: response.id,
        chatId: request.params.id,
        content,
        file,
        messageType,
        user,
        platform,
        offlineId,
        createdAt: response.createdAt,
      });
    }
  );
};
