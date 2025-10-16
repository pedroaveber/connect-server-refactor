import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
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
        params: z.object({ id: z.cuid() }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const document = await prisma.ambulanceDocuments.findUnique({ where: { id } });
      if (!document) throw new ResourceNotFoundException("Documento não encontrado");

      await prisma.ambulanceDocuments.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
