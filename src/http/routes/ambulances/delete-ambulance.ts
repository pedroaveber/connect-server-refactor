import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteAmbulance: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Delete (soft) an ambulance by ID",
        operationId: "deleteAmbulance",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      // Verifica se existe a ambulância
      const ambulance = await prisma.ambulance.findUnique({
        where: { id },
      });

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulância não encontrada");
      }

      // Soft delete
      await prisma.ambulance.delete({
        where: { id },
      });

      return reply.status(204).send();
    }
  );
};
