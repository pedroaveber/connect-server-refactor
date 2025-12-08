import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const BILLING_TYPES = ["FIXED", "BY_AMBULANCE", "BY_BASE"] as const;

export const createModule: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/modules",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Create module",
        operationId: "createModule",
        security: [{ BearerAuth: [] }],
        description: "Create module",
        body: z.object({
          name: z.string(),
          billingValue: z.number(),
          billingType: z.enum(BILLING_TYPES),
        }),
        response: {
          201: z.object({
            id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { name, billingValue, billingType } = request.body;

      const module = await prisma.modules.create({
        data: {
          name,
          billingValue,
          billingType,
        },
      });

      return reply.status(201).send({
        id: module.id,
      });
    }
  );
};
