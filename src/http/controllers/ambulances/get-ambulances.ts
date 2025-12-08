import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { zodAmbulanceStatusEnum } from "@/utils/zod";

export const getAmbulances: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulances",
        operationId: "getAmbulances",
        security: [{ BearerAuth: [] }],
        description: "Get ambulances",
        querystring: z
          .object({
            page: z.coerce.number().int().min(1).default(1),
            perPage: z.coerce.number().int().min(1).default(10),
            name: z.string().optional(),
            basesId: z.array(z.string()).optional(),
            unitsId: z.array(z.string()).optional(),
            companiesId: z.array(z.string()).optional(),
            companyGroupId: z.string().optional(),
            status: z.array(zodAmbulanceStatusEnum).optional(),
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
                licensePlate: z.string(),
                companyGroup: z.object({
                  id: z.string(),
                  name: z.string(),
                  document: z.string(),
                }),
                company: z.object({
                  id: z.string(),
                  name: z.string(),
                  document: z.string(),
                }),
                unit: z.object({
                  id: z.string(),
                  name: z.string(),
                }),
                base: z.object({
                  id: z.string(),
                  name: z.string(),
                  document: z.string().nullable(),
                }),
                documents: z.array(
                  z.object({
                    id: z.string(),
                    title: z.string(),
                    type: z.string(),
                    content: z.string(),
                    validUntil: z.string().nullable(),
                    createdAt: z.date(),
                  })
                ),
                statusHistory: z.array(
                  z.object({
                    id: z.string(),
                    fromStatus: zodAmbulanceStatusEnum,
                    toStatus: zodAmbulanceStatusEnum,
                    createdAt: z.date(),
                    user: z.object({
                      id: z.string(),
                      name: z.string(),
                    }),
                  })
                ),
                ambulanceShiftHistories: z.array(
                  z.object({
                    id: z.string(),
                    shiftStart: z.date(),
                    shiftEnd: z.date().nullable(),
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
        status,
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

      if (status) {
        whereScope = { ...whereScope, status: { in: status } };
      }

      const [ambulances, total] = await Promise.all([
        prisma.ambulance.findMany({
          include: {
            documents: {
              where: { deletedAt: null },
            },
            companyGroup: {
              select: {
                id: true,
                name: true,
                document: true,
              },
            },
            company: {
              select: {
                id: true,
                name: true,
                document: true,
              },
            },
            unit: {
              select: {
                id: true,
                name: true,
              },
            },
            base: {
              select: {
                id: true,
                name: true,
                document: true,
              },
            },
            statusHistory: {
              select: {
                id: true,
                fromStatus: true,
                toStatus: true,
                createdAt: true,
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
              orderBy: {
                createdAt: "desc",
              },
              take: 10,
            },
            ambulanceShiftHistories: {
              orderBy: { createdAt: "desc" },
              take: 1,
              select: {
                id: true,
                shiftStart: true,
                shiftEnd: true,
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
