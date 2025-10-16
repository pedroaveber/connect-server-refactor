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
        summary: "List modules with pagination",
        operationId: "getModules",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
        }),
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
            pagination: z.object({
              total: z.number(),
              totalPages: z.number(),
              hasNextPage: z.boolean(),
              hasPreviousPage: z.boolean(),
              currentPage: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { page, perPage, name } = request.query;
      const filters: any = {};
      if (name) filters.name = { contains: name };

      const [modules, total] = await Promise.all([
        prisma.module.findMany({
          where: filters,
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.module.count({ where: filters }),
      ]);

      const totalPages = Math.ceil(total / perPage);

      return reply.status(200).send({
        data: modules,
        pagination: {
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          currentPage: page,
        },
      });
    }
  );
};
