import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const bulkUpdateDocumentsSchema = z.object({
  documents: z.array(
    z.object({
      id: z.cuid(),
      documentTitle: z.string().optional(),
      documentType: z.string().optional(),
      documentUrl: z.string().optional(),
      validUntil: z.date().nullable().optional(),
    })
  ),
});

export const updateAmbulanceDocumentsInBulk: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/ambulances/:id/documents",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Update multiple ambulance documents",
        operationId: "updateAmbulanceDocumentsInBulk",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: bulkUpdateDocumentsSchema,
        response: { 200: z.object({ updatedCount: z.number() }) },
      },
    },
    async (request, reply) => {
      const { id: ambulanceId } = request.params;
      const { documents } = request.body;

      // Verifica se a ambulância existe
      const ambulance = await prisma.ambulance.findUnique({
        where: { id: ambulanceId },
      });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

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
