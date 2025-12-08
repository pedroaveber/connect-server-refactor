import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getBases: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get bases",
        operationId: "getBases",
        security: [{ BearerAuth: [] }],
        description: "Get bases",
        querystring: z
          .object({
            page: z.coerce.number().int().min(1).default(1),
            perPage: z.coerce.number().int().min(1).default(10),
            name: z.string().optional(),
            unitsId: z.array(z.string()).optional(),
            companiesId: z.array(z.string()).optional(),
            companyGroupId: z.string().optional(),
          })
          .refine(
            (data) =>
              [data.companyGroupId, data.companiesId, data.unitsId].filter(
                Boolean
              ).length === 1,
            {
              message:
                "Informe apenas um dos campos: 'companyGroupId', 'companiesId' ou 'unitsId'",
              path: ["companyGroupId"], // o campo onde o erro será exibido
            }
          ),
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
                unit: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
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
      request.authorize({
        permission: permissions.base.read,
        target: {
          companyGroupId: request.query.companyGroupId,
          companyId: request.query.companiesId,
          unitId: request.query.unitsId,
        },
      });
      const { page, perPage, name, companyGroupId, companiesId, unitsId } =
        request.query;

      let whereScope;

      if (companyGroupId) {
        whereScope = { companyGroupId };
      } else if (companiesId && companiesId.length > 0) {
        whereScope = {
          unit: { companyId: { in: companiesId } },
        };
      } else if (unitsId && unitsId.length > 0) {
        whereScope = { unitId: { in: unitsId } };
      }

      const [bases, total] = await Promise.all([
        prisma.base.findMany({
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
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
            createdAt: true,
            updatedAt: true,
          },
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            deletedAt: null,
            ...whereScope,
          },
          orderBy: {
            createdAt: "desc",
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.base.count({
          where: {
            name: {
              contains: name,
              mode: "insensitive",
            },
            deletedAt: null,
            ...whereScope,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: bases,
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
