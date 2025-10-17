import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const addDocumentsSchema = z.object({
  documents: z.array(
    z.object({
      documentTitle: z.string(),
      documentType: z.string(),
      documentUrl: z.string(),
      validUntil: z.string().pipe(z.coerce.date()).optional(),
    })
  ),
});

export const createAmbulanceDocuments: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances/:id/documents",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Add documents to an ambulance",
        operationId: "addAmbulanceDocuments",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: addDocumentsSchema,
        response: { 201: z.object({ addedCount: z.number() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { documents } = request.body;

      const ambulance = await prisma.ambulance.findUnique({ where: { id } });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

      const created = await prisma.ambulanceDocuments.createMany({
        data: documents.map((doc) => ({ ...doc, ambulanceId: id })),
      });

      return reply.status(201).send({ addedCount: created.count });
    }
  );
};
