import { ambulanceStatusEnum } from "@/data/ambulance-status";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const createStatusSchema = z.object({
  status: z.enum(ambulanceStatusEnum),
});

export const createAmbulanceStatus: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances/:id/statuses",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceStatus"],
        summary: "Create a status for an ambulance",
        operationId: "createAmbulanceStatus",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: createStatusSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id: ambulanceId } = request.params;
      const userId = request.user.sub;
      const { status } = request.body;

      const ambulance = await prisma.ambulance.findUnique({ where: { id: ambulanceId } });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new ResourceNotFoundException("Usuário não encontrado");

      const newStatus = await prisma.ambulanceStatus.create({
        data: { ambulanceId, status, userId },
      });

      return reply.status(201).send({ id: newStatus.id });
    }
  );
};
