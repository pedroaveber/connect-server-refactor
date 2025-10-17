import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateDocumentSchema = z.object({
  documentTitle: z.string().optional(),
  documentType: z.string().optional(),
  documentUrl: z.string().optional(),
  validUntil: z.string().pipe(z.coerce.date()).nullable().optional(),
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
        params: z.object({ id: z.cuid() }),
        body: updateDocumentSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;

      const document = await prisma.ambulanceDocuments.findUnique({ where: { id } });
      if (!document) throw new ResourceNotFoundException("Documento não encontrado");

      const updated = await prisma.ambulanceDocuments.update({
        where: { id },
        data: updates,
      });

      return reply.status(200).send({ id: updated.id });
    }
  );
};
