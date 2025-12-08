import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { BILLING_TYPES } from "./create-module";

export const getModules: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/modules",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Get modules",
        operationId: "getModules",
        security: [{ BearerAuth: [] }],
        description: "Get modules",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                billingValue: z.number(),
                billingType: z.enum(BILLING_TYPES),
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
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { page, perPage } = request.query;

      const [modules, total] = await Promise.all([
        prisma.modules.findMany({
          select: {
            id: true,
            name: true,
            billingValue: true,
            billingType: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.unit.count({
          where: {
            deletedAt: null,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: modules,
        pagination: {
          total,
          totalPages,
          hasNextPage,
          hasPreviousPage,
          currentPage: page,
        },
      });
    }
  );
};
