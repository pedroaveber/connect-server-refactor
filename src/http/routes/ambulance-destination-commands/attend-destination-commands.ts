import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const attendDestinationCommandSchema = z.object({
  attended: z.boolean().optional(),
  attendedAt: z.date().optional(),
});

export const attendDestinationCommand: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/destination-commands/:id/attend",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceDestinationCommands"],
        summary: "attend a destination command",
        operationId: "attendDestinationCommand",
        params: z.object({ id: z.cuid() }),
        body: attendDestinationCommandSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const data = request.body;

      const command = await prisma.ambulanceDestinationCommands.findUnique({ where: { id } });
      if (!command) throw new ResourceNotFoundException("Destination command não encontrada");

      const updated = await prisma.ambulanceDestinationCommands.update({
        where: { id, deletedAt: null },
        data,
      });

      return reply.status(200).send({ id: updated.id });
    }
  );
};
