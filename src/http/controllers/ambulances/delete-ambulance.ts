import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";

export const deleteAmbulance: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Delete ambulance by ID",
        params: z.object({ id: z.cuid() }),
        operationId: "deleteAmbulance",
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
      });

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found");
      }

      request.authorize({
        permission: permissions.ambulance.delete,
        target: {
          baseId: ambulance.baseId,
        },
      });

      await prisma.ambulance.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return reply.status(204).send(null);
    }
  );
};
