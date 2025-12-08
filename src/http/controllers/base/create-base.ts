import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";

export const createBase: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Create a new base",
        operationId: "createBase",
        body: z.object({
          name: z.string(),
          document: z.string().optional(),
          latitude: z.number().min(-90).max(90).optional(),
          longitude: z.number().min(-180).max(180).optional(),
          unitId: z.string(),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      await request.authorize({
        permission: permissions.base.create,
        target: { unitId: request.body.unitId },
      });

      const { name, document, unitId, latitude, longitude } = request.body;

      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
      });

      if (!unit) {
        throw new ResourceNotFoundException("Unit not found");
      }

      const base = await prisma.base.create({
        data: {
          name,
          unitId,
          document,
          latitude,
          longitude,
          companyId: unit.companyId,
          companyGroupId: unit.companyGroupId,
        },
      });

      return reply.status(201).send({ id: base.id });
    }
  );
};
