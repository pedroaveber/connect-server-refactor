import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";

export const getAmbulanceDocuments: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id/documents",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulance documents by ID",
        params: z.object({ id: z.string() }),
        operationId: "getAmbulanceDocuments",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              documents: z.array(
                z.object({
                  id: z.string(),
                  title: z.string(),
                  type: z.string(),
                  content: z.string(),
                  validUntil: z.string().nullable(),
                  createdAt: z.date(),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
        include: {
          documents: {
            where: { deletedAt: null },
          },
        },
      });

      request.authorize({
        // permission: permissions.ambulance.read,
        target: {
          unitId: ambulance?.unitId,
        },
      });

      return reply.status(200).send({
        data: ambulance!,
      });
    }
  );
};
