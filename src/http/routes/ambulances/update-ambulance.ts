import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateAmbulanceSchema = z.object({
  name: z.string().optional(),
  plateNumber: z.string().optional(),
  linkingCode: z.string().optional(),
  observation: z.string().optional(),
  ambulanceBaseId: z.cuid().optional(),
  avatarUrl: z.string().optional(),
});

export const updateAmbulance: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Update an ambulance",
        operationId: "updateAmbulance",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: updateAmbulanceSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const updates = request.body;

      // Verifica se a ambulância existe
      const ambulance = await prisma.ambulance.findUnique({
        where: { id },
      });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

      // Se baseId for atualizado, verifica se existe
      if (updates.ambulanceBaseId) {
        const base = await prisma.base.findUnique({ where: { id: updates.ambulanceBaseId } });
        if (!base) throw new ResourceNotFoundException("Base não encontrada");
      }

      // Checa conflitos com plateNumber ou linkingCode
      if (updates.plateNumber || updates.linkingCode) {
        const conflict = await prisma.ambulance.findFirst({
          where: {
            OR: [
              updates.plateNumber ? { plateNumber: updates.plateNumber } : undefined,
              updates.linkingCode ? { linkingCode: updates.linkingCode } : undefined,
            ].filter(Boolean) as any[],
            NOT: { id }, // ignora a própria ambulância
          },
        });
        if (conflict) throw new ConflictException("Placa ou código já existente");
      }

      // Atualiza a ambulância
      const updated = await prisma.ambulance.update({
        where: { id },
        data: updates,
      });

      return reply.status(200).send({ id: updated.id });
    }
  );
};
