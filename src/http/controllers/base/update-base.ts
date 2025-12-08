import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const updateBase: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/bases/:baseId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Update base",
        operationId: "updateBase",
        params: z.object({ baseId: z.string() }),
        body: z.object({
          name: z.string().optional(),
          document: z.string().optional(),
          latitude: z.number().optional(),
          longitude: z.number().optional(),
        }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.base.update,
        target: {
          baseId: request.params.baseId,
        },
      });

      const { baseId } = request.params;
      const { name, document, latitude, longitude } = request.body;

      await prisma.base.update({
        where: { id: baseId },
        data: { name, document, latitude, longitude },
      });

      return reply.status(204).send(null);
    }
  );
};
