import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createShiftSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
});

export const createAmbulanceShift: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances/:id/shifts",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceShift"],
        summary: "Create a shift for an ambulance",
        operationId: "createAmbulanceShift",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: createShiftSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id: ambulanceId } = request.params;
      const userId = request.user.sub
      const { startDate, endDate } = request.body;

      // Verifica se a ambulância existe
      const ambulance = await prisma.ambulance.findUnique({
        where: { id: ambulanceId },
      });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new ResourceNotFoundException("Usuário não encontrado");

      // Cria o turno
      const shift = await prisma.ambulanceShift.create({
        data: {
          startDate,
          endDate,
          ambulanceId,
          userId,
        },
      });

      return reply.status(201).send({ id: shift.id });
    }
  );
};
