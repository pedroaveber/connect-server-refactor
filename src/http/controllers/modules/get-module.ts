import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { BILLING_TYPES } from "./create-module";

export const getModule: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/modules/:moduleId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Get Module",
        operationId: "getModule",
        security: [{ BearerAuth: [] }],
        description: "Get module",
        params: z.object({
          moduleId: z.string(),
        }),
        response: {
          200: z.object({
            data: z
              .object({
                id: z.string(),
                name: z.string(),
                billingValue: z.number(),
                billingType: z.enum(BILLING_TYPES),
              })
              .nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { moduleId } = request.params;

      const module = await prisma.modules.findUnique({
        where: {
          id: moduleId,
        },
        select: {
          id: true,
          name: true,
          billingValue: true,
          billingType: true,
        },
      });

      return reply.status(200).send({
        data: module,
      });
    }
  );
};
