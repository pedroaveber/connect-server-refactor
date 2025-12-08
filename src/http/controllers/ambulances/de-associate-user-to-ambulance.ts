import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { userHasAccess } from "@/http/hooks/permissions/user-has-access";

export const deassociateToAmbulance: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/ambulances/deassociate-user",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Deassociate user from ambulance",
        operationId: "deassociateUserFromAmbulance",
        security: [{ BearerAuth: [] }],
        body: z.object({
          userId: z.string(),
        }),
        response: { 201: z.null() },
      },
    },
    async (request, reply) => {
      const user = await prisma.user.findUnique({
        select: {
          ambulance: {
            select: {
              unitId: true,
            },
          },
        },
        where: { id: request.body.userId },
      });

      userHasAccess({
        user: request.user,
        target: {
          unitId: user?.ambulance?.unitId,
        },
        permission: permissions.ambulance.create,
      });

      const { userId } = request.body;

      await prisma.user.update({
        where: { id: userId },
        data: {
          ambulance: {
            disconnect: true,
          },
        },
      });

      return reply.status(201).send();
    }
  );
};
