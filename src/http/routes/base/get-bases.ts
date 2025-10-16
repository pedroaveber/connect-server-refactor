import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getBases: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "List all bases with pagination",
        operationId: "getBases",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          unitId: z.string(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                latitude: z.number(),
                longitude: z.number(),
                createdAt: z.date(),
                updatedAt: z.date(),
                deletedAt: z.date().nullable(),
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
      const { page, perPage, name, unitId } = request.query;

      const filters: any = { deletedAt: null, unitId };
      if (name) filters.name = { contains: name };

      const [bases, total] = await Promise.all([
        prisma.base.findMany({
          where: filters,
          skip: (page - 1) * perPage,
          take: perPage,
        }),
        prisma.base.count({ where: filters }),
      ]);

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.send({
        data: bases,
        pagination: { total, totalPages, hasNextPage, hasPreviousPage, currentPage: page },
      });
    }
  );
};
