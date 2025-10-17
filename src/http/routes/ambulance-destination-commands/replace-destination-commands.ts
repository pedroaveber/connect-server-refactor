import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const replaceDestinationCommandSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  baseId: z.string().optional(),
  attended: z.boolean().optional(),
  attendedAt: z.string().pipe(z.coerce.date()).optional(),
});

export const replaceDestinationCommand: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/destination-commands/:id/replace",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceDestinationCommands"],
        summary: "Replace a destination command (soft delete old and create new)",
        operationId: "replaceDestinationCommand",
        params: z.object({ id: z.cuid() }),
        body: replaceDestinationCommandSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { latitude, longitude, address, baseId, attended, attendedAt } = request.body;
      const userId = request.user.sub;

      // Buscar comando antigo
      const oldCommand = await prisma.ambulanceDestinationCommands.findUnique({
        where: { id },
      });
      if (!oldCommand) throw new ResourceNotFoundException("Destination command não encontrada");

      if (baseId) {
        const base = await prisma.base.findUnique({ where: { id: baseId } });
        if (!base) throw new ResourceNotFoundException("Base não encontrada");
      }

      // Soft delete do antigo
      await prisma.ambulanceDestinationCommands.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      // Criar novo comando com os dados atualizados
      const newCommand = await prisma.ambulanceDestinationCommands.create({
        data: {
          ambulanceId: oldCommand.ambulanceId,
          userId,
          latitude,
          longitude,
          address,
          baseId,
          attended,
          attendedAt,
        },
      });

      return reply.status(201).send({ id: newCommand.id });
    }
  );
};
