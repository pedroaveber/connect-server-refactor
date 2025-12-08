import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { BILLING_TYPES } from "./create-module";

export const updateModule: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/modules/:moduleId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Update module",
        operationId: "updateModule",
        security: [{ BearerAuth: [] }],
        description: "Update module",
        params: z.object({
          moduleId: z.string(),
        }),
        body: z.object({
          name: z.string(),
          billingValue: z.number(),
          billingType: z.enum(BILLING_TYPES),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { moduleId } = request.params;
      const { name, billingValue, billingType } = request.body;

      await prisma.modules.update({
        where: {
          id: moduleId,
        },
        data: {
          name,
          billingValue,
          billingType,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
