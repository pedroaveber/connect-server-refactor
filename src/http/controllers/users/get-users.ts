import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getUsers: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get users",
        security: [{ BearerAuth: [] }],
        operationId: "getUsers",
        querystring: z.object({
          companyGroupId: z.string().optional(),
          companyId: z.string().optional(),
          unitId: z.string().optional(),
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                document: z.string(),
                avatarUrl: z.string().nullable(),
                birthDate: z.date(),
                createdAt: z.date(),
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
        permission: permissions.user.read,
        target: {
          companyGroupId: request.query.companyGroupId,
          companyId: request.query.companyId,
          unitId: request.query.unitId,
        },
      });
      const { page, perPage, companyGroupId, companyId, unitId } =
        request.query;

      let whereScope;
      if (companyGroupId) {
        whereScope = { companyGroupId };
      } else if (companyId) {
        whereScope = {
          companies: {
            some: companyId ? { id: companyId } : undefined,
          },
        };
      } else if (unitId) {
        whereScope = {
          units: {
            some: unitId ? { id: unitId } : undefined,
          },
        };
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where: whereScope,
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: "desc" },
        }),
        prisma.user.count({
          where: whereScope,
        }),
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
