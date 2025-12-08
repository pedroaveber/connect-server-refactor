import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { userHasAccess } from "@/http/hooks/permissions/user-has-access";

export const associateToAmbulance: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/ambulances/associate-user",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Associate user to ambulance",
        operationId: "associateUserToAmbulance",
        security: [{ BearerAuth: [] }],
        body: z.object({
          ambulanceId: z.string(),
          userId: z.string(),
        }),
        response: {
          201: z.object({
            userId: z.string(),
            ambulanceId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const ambulance = await prisma.ambulance.findUnique({
        select: {
          unitId: true,
        },
        where: { id: request.body.ambulanceId, deletedAt: null },
      });
      userHasAccess({
        user: request.user,
        target: {
          unitId: ambulance?.unitId,
        },
        // permission: permissions.ambulance.read,
      });

      const { ambulanceId, userId } = request.body;

      await prisma.user.update({
        where: { id: userId },
        data: {
          ambulance: {
            connect: { id: ambulanceId },
          },
        },
      });

      return reply.status(201).send({
        userId,
        ambulanceId,
      });
    }
  );
};
