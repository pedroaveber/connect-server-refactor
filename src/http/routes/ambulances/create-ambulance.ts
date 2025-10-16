import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createAmbulanceSchema = z.object({
  name: z.string(),
  plateNumber: z.string(),
  ambulanceBaseId: z.cuid(),
  observation: z.string().optional(),
  linkingCode: z.string().optional(),
  avatarUrl: z.string().optional(),
});

export const createAmbulance: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Create ambulance",
        operationId: "createAmbulance",
        security: [{ BearerAuth: [] }],
        body: createAmbulanceSchema,
        response: { 201: z.object({ id: z.cuid() }) },
      },
    },
    async (request, reply) => {
      const { name, observation, plateNumber, linkingCode, ambulanceBaseId } =
        request.body;

      const base = await prisma.base.findUnique({ where: { id: ambulanceBaseId } });
      if (!base) throw new ResourceNotFoundException("Base não encontrada");

      const existing = await prisma.ambulance.findFirst({
        where: { OR: [{ plateNumber }, { linkingCode }] },
      });
      if (existing) throw new ConflictException("Placa ou código já existente");

      const ambulance = await prisma.ambulance.create({
        data: { name, observation, plateNumber, linkingCode, ambulanceBaseId },
      });

      return reply.status(201).send({ id: ambulance.id });
    }
  );
};
