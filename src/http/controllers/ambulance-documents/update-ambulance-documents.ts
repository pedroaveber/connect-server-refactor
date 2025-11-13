import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateDocumentSchema = z.object({
  id: z.string(),
  name: z.string(),
  downloadUrl: z.string().url(),
  fileExtension: z.string(),
  fileSize: z.number(),
  ambulanceId: z.string(),
  expiresAt: z.string().pipe(z.coerce.date()),
});

export const updateAmbulanceDocument: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/ambulances/documents/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Update an ambulance document",
        operationId: "updateAmbulanceDocument",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string(), baseId: z.string() }),
        body: updateDocumentSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      request.authorize({
        target: {
          baseId: request.params.baseId,
        },
        permission: permissions.ambulanceDocuments.update,
      });

      const { id } = request.params;
      const updates = request.body;

      const updated = await prisma.ambulanceDocuments.update({
        where: { id },
        data: updates,
      });

      return reply.status(200).send({ id: updated.id });
    }
  );
};
