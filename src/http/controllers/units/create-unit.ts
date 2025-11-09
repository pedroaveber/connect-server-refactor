import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createUnit: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/units",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Create unit",
        operationId: "createUnit",
        security: [{ BearerAuth: [] }],
        description: "Create unit",
        body: z.object({
          name: z.string(),
          companyId: z.cuid().meta({
            description: "Company ID",
          }),
          companyGroupId: z.string().meta({
            description: "Company Group ID",
          }),
        }),
        response: {
          201: z.object({
            id: z.cuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.unit.create,
        target: {
          companyId: request.body.companyId,
        },
      });

      const { name, companyId, companyGroupId } = request.body;

      const unit = await prisma.unit.create({
        data: {
          name,
          companyGroupId,
          companyId,
        },
      });

      return reply.status(201).send({
        id: unit.id,
      });
    }
  );
};
