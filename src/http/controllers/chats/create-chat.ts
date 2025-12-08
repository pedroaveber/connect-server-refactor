import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";

export const createChat: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/chats/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Create a new chat",
        operationId: "createChat",
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          baseId: z.string(),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      await request.authorize({
        permission: permissions.chat.create,
        target: { baseId: request.body.baseId },
      });

      const response = await prisma.chats.create({
        data: {
          ambulance: {
            connect: { id: request.params.id },
          },
        },
      });

      return reply.status(201).send({ id: response.id });
    }
  );
};
