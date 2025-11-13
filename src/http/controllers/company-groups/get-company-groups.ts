import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getCompanyGroups: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Get company groups",
        operationId: "getCompanyGroups",
        security: [{ BearerAuth: [] }],
        description: "Get company groups",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          name: z.string().optional(),
          document: z.string().optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                document: z.string(),
                companiesCount: z.number(),
                createdAt: z.date(),
                updatedAt: z.date(),
                phones: z.array(
                  z.object({
                    id: z.string(),
                    number: z.string(),
                    name: z.string().nullable(),
                    isWhatsapp: z.boolean(),
                    createdAt: z.date(),
                  })
                ),
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

      const { page, perPage, name, document } = request.query;

      const [companyGroups, total] = await Promise.all([
        prisma.companyGroup.findMany({
          select: {
            id: true,
            name: true,
            document: true,
            createdAt: true,
            updatedAt: true,
            phones: {
              select: {
                id: true,
                number: true,
                name: true,
                isWhatsapp: true,
                createdAt: true,
              },
            },
            _count: {
              select: {
                companies: true,
              },
            },
          },
          where: {
            name: {
              contains: name,
            },
            document: {
              contains: document,
            },
            deletedAt: null,
          },
          skip: (page - 1) * perPage,
          take: perPage,
        }),

        prisma.companyGroup.count({
          where: {
            name: {
              contains: name,
            },
            document: {
              contains: document,
            },
            deletedAt: null,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / perPage);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      console.log(companyGroups);

      return reply.status(200).send({
        data: companyGroups.map((companyGroup) => ({
          ...companyGroup,
          companiesCount: companyGroup._count.companies,
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
