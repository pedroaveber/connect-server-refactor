import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";

export const updateAmbulance: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Update an ambulance",
        operationId: "updateAmbulance",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: z.object({
          name: z.string(),
          licensePlate: z.string(),
          observations: z.string().optional(),
          baseId: z.string(),
        }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, licensePlate, observations } = request.body;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
      });

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found");
      }

      request.authorize({
        permission: permissions.ambulance.update,
        target: {
          baseId: ambulance.baseId,
        },
      });

      await prisma.ambulance.update({
        where: { id },
        data: { name, licensePlate, observations },
      });

      return reply.status(204).send(null);
    }
  );
};
