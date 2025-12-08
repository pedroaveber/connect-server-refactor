import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { BillingType } from "@prisma/client";

export const updateCompanyModule: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/company/modules/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Update company module",
        operationId: "updateCompanyModule",
        security: [{ BearerAuth: [] }],
        description: "Update company module",
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          customBillingValue: z.number().nullable().optional(),
          customBillingType: z.enum(BillingType).nullable().optional(),
          active: z.boolean().optional(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              customBillingValue: z.number().nullable(),
              customBillingType: z.enum(BillingType).nullable(),
              active: z.boolean(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { id } = request.params;
      const { customBillingType, customBillingValue, active } = request.body;

      const companyModule = await prisma.companyModules.update({
        where: {
          id,
        },
        data: {
          customBillingType,
          customBillingValue,
          active,
        },
      });

      return reply.status(200).send({ data: companyModule });
    }
  );
};
