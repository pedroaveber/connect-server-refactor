import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteAmbulanceDocument: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/ambulances/documents/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Delete (soft) an ambulance document",
        operationId: "deleteAmbulanceDocument",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string(), baseId: z.string() }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      request.authorize({
        target: {
          baseId: request.params.baseId,
        },
        permission: permissions.ambulanceDocuments.delete,
      });

      const { id } = request.params;

      await prisma.ambulanceDocuments.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
