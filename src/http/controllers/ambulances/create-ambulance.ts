import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { userHasAccess } from "@/http/hooks/permissions/user-has-access";

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
        body: z.object({
          name: z.string(),
          companyGroupId: z.string(),
          companyId: z.string(),
          unitId: z.string(),
          baseId: z.string(),
          licensePlate: z.string().meta({
            description: "License plate of the ambulance",
          }),
          ambulanceCode: z.string().meta({
            description: "Unique code for the ambulance",
          }),
          observations: z.string().optional(),
        }),
        response: { 201: z.object({ id: z.string(), baseId: z.string() }) },
      },
    },
    async (request, reply) => {
      userHasAccess({
        user: request.user,
        target: {
          baseId: request.body.baseId,
        },
        permission: permissions.ambulance.create,
      });

      const {
        name,
        observations,
        licensePlate,
        baseId,
        unitId,
        companyId,
        companyGroupId,
        ambulanceCode,
      } = request.body;

      const ambulance = await prisma.ambulance.create({
        data: {
          name,
          observations,
          licensePlate,
          baseId,
          unitId,
          companyId,
          companyGroupId,
          ambulanceCode,
        },
      });

      prisma.chats.create({
        data: {
          ambulance: { connect: { id: ambulance.id } },
        },
      });

      return reply
        .status(201)
        .send({ id: ambulance.id, baseId: ambulance.baseId });
    }
  );
};
