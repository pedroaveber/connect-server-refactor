import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createDestinationCommandSchema = z.object({
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  address: z.string().optional(),
  baseId: z.string().optional(),
});

export const createDestinationCommand: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances/:ambulanceId/destination-commands",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceDestinationCommands"],
        summary: "Create a destination command for an ambulance",
        operationId: "createDestinationCommand",
        params: z.object({ ambulanceId: z.cuid() }),
        body: createDestinationCommandSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { ambulanceId } = request.params;
      const { latitude, longitude, address, baseId } = request.body;
      const userId = request.user.sub;

      const ambulance = await prisma.ambulance.findUnique({ where: { id: ambulanceId } });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

      if (baseId) {
        const base = await prisma.base.findUnique({ where: { id: baseId } });
        if (!base) throw new ResourceNotFoundException("Base não encontrada");
      }

       const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ResourceNotFoundException("Usuário não encontrado");

      const command = await prisma.ambulanceDestinationCommands.create({
        data: { ambulanceId, latitude, longitude, address, baseId, userId },
      });

      return reply.status(201).send({ id: command.id });
    }
  );
};
