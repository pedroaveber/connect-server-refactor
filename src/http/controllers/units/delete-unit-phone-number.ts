import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteUnitPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/units/:unitId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Delete unit phone number",
        operationId: "deleteUnitPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete unit phone number",
        params: z.object({
          unitId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.unit.deletePhoneNumber,
        target: {
          unitId: request.params.unitId,
        },
      });

      const { phoneId } = request.params;

      await prisma.phone.delete({
        where: {
          id: phoneId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
