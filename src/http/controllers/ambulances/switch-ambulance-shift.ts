import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { ably } from "@/utils/ably";

export const switchAmbulanceShift: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/ambulances/:id/switch-shift",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Switch an ambulance shift",
        operationId: "switchAmbulanceShift",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: z.object({
          shiftStart: z.string(),
          shiftEnd: z.string(),
        }),
        response: {
          204: z.object({
            id: z.string(),
            shiftStart: z.string(),
            shiftEnd: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { shiftStart, shiftEnd } = request.body;

      const ambulance = await prisma.ambulance.findUnique({
        select: {
          id: true,
          companyGroupId: true,
          unitId: true,
          chats: {
            select: {
              id: true,
            },
          },
          statusHistory: {
            select: {
              id: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        where: { id, deletedAt: null },
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

      await prisma.$transaction(async (tx) => {
        await tx.ambulanceShiftHistory.create({
          data: {
            shiftStart,
            shiftEnd,
            ambulanceId: id,
            userId: request.user.sub,

            // só adiciona o connect se existir id
            ...(ambulance.statusHistory[0]?.id && {
              ambulanceStatusHistory: {
                connect: {
                  id: ambulance.statusHistory[0].id,
                },
              },
            }),
          },
        });
      });

      const channel = ably.channels.get(`connect-${ambulance.companyGroupId}`);

      channel.publish("shiftStatus", {
        id: ambulance.id,
        shiftStart,
        shiftEnd,
      });

      return reply.status(204).send({
        id: ambulance.id,
        shiftStart,
        shiftEnd,
      });
    }
  );
};
