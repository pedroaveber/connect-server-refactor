import { moduleBillingTypeEnum } from "@/data/module-billing-type";
import { moduleNamesEnum } from "@/data/modules-names";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getModules: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/modules",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "List modules",
        operationId: "getModules",
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.enum(moduleNamesEnum),
                description: z.string().nullable(),
                billingType: z.enum(moduleBillingTypeEnum),
                defaultPrice: z.number(),
                internal: z.boolean(),
                createdAt: z.date(),
                updatedAt: z.date(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const modules = await prisma.module.findMany()

      return reply.status(200).send({
        data: modules,
      });
    }
  );
};
