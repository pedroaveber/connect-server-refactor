import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { zodAmbulanceStatusEnum } from "@/utils/zod";
import { permissions } from "@/data/permissions";
import { ably } from "@/utils/ably";

export const switchAmbulanceStatus: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/ambulances/:id/switch-status",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Switch an ambulance status",
        operationId: "switchAmbulanceStatus",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string() }),
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
        select: {
          id: true,
          status: true,
          companyGroupId: true,
          unitId: true,
          chats: {
            select: {
              id: true,
            },
          },
          ambulanceShiftHistories: {
            select: {
              id: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found");
      }

      request.authorize({
        permission: permissions.ambulance.switchStatus,
        target: {
          unitId: ambulance.unitId,
        },
      });

      // if (ambulance.status === status) {
      //   throw new BadRequestException("Ambulance already has this status");
      // }

      await prisma.$transaction(async (tx) => {
        await tx.ambulanceStatusHistory.create({
          data: {
            fromStatus: ambulance.status,
            toStatus: status,
            ambulanceId: id,
            userId: request.user.sub,

            ...(ambulance.ambulanceShiftHistories[0]?.id && {
              ambulanceShiftId: ambulance.ambulanceShiftHistories[0].id,
            }),
          },
        });

        await tx.ambulance.update({
          where: { id },
          data: { status },
        });
      });

      const channel = ably.channels.get(`connect-${ambulance.companyGroupId}`);

      channel.publish("status", {
        id: ambulance.id,
        chatIds: ambulance.chats.map((chat) => chat.id),
        status: status,
      });

      console.log({
        id: ambulance.id,
        chatIds: ambulance.chats.map((chat) => chat.id),
        status: status,
      });

      return reply.status(204).send(null);
    }
  );
};
