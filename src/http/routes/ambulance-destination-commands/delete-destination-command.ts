import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const deleteDestinationCommand: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/destination-commands/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceDestinationCommands"],
        summary: "Delete a destination command",
        operationId: "deleteDestinationCommand",
        params: z.object({
          id: z.cuid(),
        }),
        response: {
          204: z.object({
            id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const command = await prisma.ambulanceDestinationCommands.findUnique({
        where: { id },
      });
      if (!command)
        throw new ResourceNotFoundException(
          "Destination command não encontrada"
        );

      await prisma.ambulanceDestinationCommands.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return reply.status(204).send({
        id,
      });
    }
  );
};
