import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteBasePhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/bases/:baseId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Delete base phone number",
        operationId: "deleteBasePhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete a phone number from a base",
        params: z.object({
          baseId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      await request.authorize({
        permission: permissions.base.deletePhoneNumber,
        target: { baseId: request.params.baseId },
      });
      const { baseId, phoneId } = request.params;

      await prisma.phone.delete({
        where: {
          id: phoneId,
          baseId: baseId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
