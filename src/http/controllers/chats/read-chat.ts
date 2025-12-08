import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { Platform } from "@prisma/client";
import { ably } from "@/utils/ably";

export const readChat: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/chats/:id/read",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Mark chat as read",
        operationId: "readChat",
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          platform: z.enum(Platform),
          unitId: z.string(),
        }),
        response: {
          201: z.object({
            id: z.string(),
            platform: z.string(),
            readAt: z.date(),
          }),
        },
      },
    },
    async (request, reply) => {
      await request.authorize({
        permission: permissions.chat.read,
        target: { unitId: request.body.unitId },
      });

      const { id } = request.params;
      const { platform } = request.body;

      const now = new Date();

      const response = await prisma.chats.update({
        where: {
          id,
        },
        include: {
          ambulance: {
            select: {
              companyGroupId: true,
            },
          },
        },
        data:
          platform === Platform.APP
            ? { readByAppAt: now }
            : { readByWebAt: now },
      });

      const channel = ably.channels.get(
        `connect-${response.ambulance.companyGroupId}`
      );

      channel.publish("readChat", {
        id,
        platform,
        readAt: now,
      });

      return reply.status(201).send({ id: response.id, platform, readAt: now });
    }
  );
};
