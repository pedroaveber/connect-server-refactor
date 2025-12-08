import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { zodAmbulanceStatusEnum } from "@/utils/zod";

export const getAmbulancesControl: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/control",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulances for control",
        operationId: "getAmbulancesControl",
        security: [{ BearerAuth: [] }],
        description: "Get ambulances for control",
        querystring: z
          .object({
            page: z.coerce.number().int().min(1).default(1),
            perPage: z.coerce.number().int().min(1).default(10),
            name: z.string().optional(),
            basesId: z.array(z.string()).optional(),
            unitsId: z.array(z.string()).optional(),
            companiesId: z.array(z.string()).optional(),
            companyGroupId: z.string().optional(),
          })
          .refine(
            (data) =>
              [
                data.companyGroupId,
                data.companiesId,
                data.unitsId,
                data.basesId,
              ].filter(Boolean).length === 1,
            {
              message:
                "Informe apenas um dos campos: 'companyGroupId', 'companiesId', 'unitsId' ou 'basesId'",
              path: ["companyGroupId"], // o campo onde o erro será exibido
            }
          ),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                status: zodAmbulanceStatusEnum,
                observations: z.string().nullable(),
                ambulanceShiftHistories: z.array(
                  z.object({
                    id: z.string(),
                    shiftStart: z.date(),
                    shiftEnd: z.date(),
                  })
                ),
                companyGroup: z.object({
                  id: z.string(),
                }),
                company: z.object({
                  id: z.string(),
                }),
                unit: z.object({
                  id: z.string(),
                }),
                base: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
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
      const {
        page,
        perPage,
        name,
        companyGroupId,
        companiesId,
        unitsId,
        basesId,
      } = request.query;

      let whereScope;

      if (companyGroupId) {
        whereScope = { companyGroupId };
      } else if (companiesId && companiesId.length > 0) {
        whereScope = {
          unit: { companyId: { in: companiesId } },
        };
      } else if (unitsId && unitsId.length > 0) {
        whereScope = { unitId: { in: unitsId } };
      } else if (basesId && basesId.length > 0) {
        whereScope = { baseId: { in: basesId } };
      }

      const [ambulances, total] = await Promise.all([
        prisma.ambulance.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            observations: true,
            ambulanceShiftHistories: {
              select: {
                id: true,
                shiftStart: true,
                shiftEnd: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            companyGroup: {
              select: {
                id: true,
              },
            },
            company: {
              select: {
                id: true,
              },
            },
            unit: {
              select: {
                id: true,
              },
            },
            base: {
              select: {
                id: true,
                name: true,
              },
            },
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

        prisma.ambulance.count({
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
        data: ambulances,
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
