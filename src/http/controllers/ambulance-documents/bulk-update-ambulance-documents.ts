import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const bulkUpdateDocumentsSchema = z.object({
  documents: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      validUntil: z.string().nullable(),
      content: z.string(),
    })
  ),
  baseId: z.string(),
});

export const updateAmbulanceDocumentsInBulk: FastifyPluginCallbackZod = (
  app
) => {
  app.put(
    "/ambulances/documents",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Update multiple ambulance documents",
        operationId: "updateAmbulanceDocumentsInBulk",
        security: [{ BearerAuth: [] }],
        body: bulkUpdateDocumentsSchema,
        response: { 200: z.object({ updatedCount: z.number() }) },
      },
    },
    async (request, reply) => {
      request.authorize({
        target: {
          baseId: request.body.baseId,
        },
        permission: permissions.ambulanceDocuments.bulkUpdate,
      });

      const { documents } = request.body;

      // Atualiza documentos em massa
      let updatedCount = 0;
      for (const doc of documents) {
        const existingDoc = await prisma.ambulanceDocuments.findUnique({
          where: { id: doc.id },
        });
        if (!existingDoc) continue;

        await prisma.ambulanceDocuments.update({
          where: { id: doc.id },
          data: { ...doc },
        });
        updatedCount++;
      }

      return reply.status(200).send({ updatedCount });
    }
  );
};
