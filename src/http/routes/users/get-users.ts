import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const userQuerySchema = z
  .object({
    companyGroupId: z.string().optional(),
    companyId: z.string().optional(),
    unitId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).default(10),
  })
  .refine(
    (data) => {
      const hierarchyFilters = [
        data.companyGroupId,
        data.companyId,
        data.unitId,
      ].filter(Boolean);
      return hierarchyFilters.length <= 1;
    },
    {
      message:
        "Você só pode passar um entre unitId, companyId ou companyGroupId",
      path: ["unitId", "companyId", "companyGroupId"],
    }
  );

export const getUsers: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "List users with optional hierarchical filtering",
        security: [{ BearerAuth: [] }],
        operationId: "getUsers",
        querystring: userQuerySchema,
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                document: z.string(),
                avatarUrl: z.string().nullable(),
                birthDate: z.date(),
                units: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                  })
                ),
                roles: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string(),
                  })
                ),
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
      const { companyGroupId, companyId, unitId, page, perPage } =
        request.query;

      const where: any = {};
      if (unitId) {
        where.units = { some: { id: unitId } };
      } else if (companyId) {
        where.units = { some: { companyId } };
      } else if (companyGroupId) {
        where.units = { some: { company: { companyGroupId } } };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            units: { select: { id: true, name: true } },
            roles: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: users,
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
