import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { BadRequestException } from "@/http/exceptions/bad-request-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { zodAmbulanceStatusEnum } from "@/utils/zod";
import { permissions } from "@/data/permissions";

export const switchAmbulanceStatus: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/ambulances/:id/switch-status",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Switch an ambulance status",
        operationId: "switchAmbulanceStatus",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: z.object({
          status: zodAmbulanceStatusEnum,
        }),
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
      });

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found");
      }

      request.authorize({
        permission: permissions.ambulance.read,
        target: {
          baseId: ambulance.baseId,
        },
      });

      if (ambulance.status === status) {
        throw new BadRequestException("Ambulance already has this status");
      }

      await prisma.$transaction(async (tx) => {
        await tx.ambulanceStatusHistory.create({
          data: {
            fromStatus: ambulance.status,
            toStatus: status,
            ambulanceId: id,
            userId: request.user.sub,
          },
        });

        await tx.ambulance.update({
          where: { id },
          data: { status },
        });
      });

      return reply.status(204).send(null);
    }
  );
};
