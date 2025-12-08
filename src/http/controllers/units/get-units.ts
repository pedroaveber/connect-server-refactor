import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getUnits: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/units",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Get units",
        operationId: "getUnits",
        security: [{ BearerAuth: [] }],
        description: "Get units",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          document: z.string().optional(),
          companyGroupId: z.string().optional(),
          companyId: z.string().optional(),
          companiesId: z.array(z.string()).optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                companyGroup: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
                company: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
                createdAt: z.date(),
                updatedAt: z.date(),
                basesCount: z.number(),
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
        permission: permissions.unit.read,
        target: {
          companyGroupId: request.query.companyGroupId,
          companyId: request.query.companyId,
        },
      });

      const { page, perPage, name, companyGroupId, companyId, companiesId } =
        request.query;

      let whereScope;

      if (companyGroupId) {
        whereScope = { companyGroupId };
      } else if (companyId) {
        whereScope = { companyId };
      } else if (companiesId) {
        whereScope = { companyId: { in: companiesId } };
      }

      const [units, total] = await Promise.all([
        prisma.unit.findMany({
          select: {
            id: true,
            name: true,
            companyGroup: {
              select: {
                id: true,
                name: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
            _count: {
              select: {
                bases: {
                  where: {
                    deletedAt: null,
                  },
                },
              },
            },
          },
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            ...whereScope,
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.unit.count({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            ...whereScope,
            deletedAt: null,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: units.map((unit) => ({
          ...unit,
          basesCount: unit._count.bases,
        })),
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
