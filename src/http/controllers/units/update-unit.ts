import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const updateUnit: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Update unit",
        operationId: "updateUnit",
        security: [{ BearerAuth: [] }],
        description: "Update unit",
        params: z.object({
          unitId: z.string(),
        }),
        body: z.object({
          name: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.unit.update,
        target: {
          unitId: request.params.unitId,
        },
      });

      const { unitId } = request.params;
      const { name } = request.body;

      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: {
          name,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
