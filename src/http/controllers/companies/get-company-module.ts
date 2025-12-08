import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { BillingType } from "@prisma/client";

export const getCompanyModules: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company/modules/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get company modules",
        operationId: "getCompanyModules",
        security: [{ BearerAuth: [] }],
        description: "Get company modules",
        params: z.object({
          id: z.string(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                customBillingValue: z.number().nullable(),
                customBillingType: z.enum(BillingType).nullable(),
                active: z.boolean(),
                module: z.object({
                  name: z.string(),
                  billingValue: z.number(),
                  billingType: z.enum(BillingType),
                }),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { id } = request.params;

      const companyModules = await prisma.companyModules.findMany({
        where: {
          companyId: id,
        },
        select: {
          id: true,
          customBillingValue: true,
          customBillingType: true,
          active: true,
          module: {
            select: {
              name: true,
              billingValue: true,
              billingType: true,
            },
          },
        },
      });

      return reply.status(200).send({ data: companyModules });
    }
  );
};
