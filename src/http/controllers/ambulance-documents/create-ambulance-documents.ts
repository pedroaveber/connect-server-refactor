import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const addDocumentsSchema = z.object({
  documents: z.array(
    z.object({
      name: z.string(),
      downloadUrl: z.string().url(),
      fileExtension: z.string(),
      fileSize: z.number(),
      ambulanceId: z.string(),
      expiresAt: z.string().pipe(z.coerce.date()),
    })
  ),
  baseId: z.string(),
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
      request.authorize({
        target: {
          baseId: request.body.baseId,
        },
        permission: permissions.ambulanceDocuments.create,
      });

      const { id } = request.params;
      const { documents } = request.body;

      const created = await prisma.ambulanceDocuments.createMany({
        data: documents.map((doc) => ({ ...doc, ambulanceId: id })),
      });

      return reply.status(201).send({ addedCount: created.count });
    }
  );
};
