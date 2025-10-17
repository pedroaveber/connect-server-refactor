import { ambulanceStatusEnum } from "@/data/ambulance-status";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getAmbulances: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "List ambulances with pagination, filters, and details",
        security: [{ BearerAuth: [] }],
        operationId: "getAmbulances",
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
          companyGroupId: z.string().optional(),
          companyId: z.string().optional(),
          unitId: z.string().optional(),
          baseId: z.string().optional(),
          name: z.string().optional(),
          plateNumber: z.string().optional(),
          linkingCode: z.string().optional(),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                plateNumber: z.string(),
                linkingCode: z.string().nullable(),
                observation: z.string().nullable(),
                ambulanceBaseId: z.string(),
                ambulanceDocuments: z.array(
                  z.object({
                    id: z.string(),
                    documentTitle: z.string(),
                    documentType: z.string(),
                    documentUrl: z.string(),
                    validUntil: z.date().nullable(),
                  })
                ),
                ambulanceShift: z.array(
                  z.object({
                    startDate: z.date(),
                    endDate: z.date(),
                    user: z.object({ name: z.string().nullable() }).nullable(),
                  })
                ),
                ambulanceStatus: z.array(
                  z.object({
                    status: z.enum(ambulanceStatusEnum),
                    user: z.object({ name: z.string().nullable() }).nullable(),
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
      const {
        page,
        perPage,
        name,
        plateNumber,
        linkingCode,
        companyGroupId,
        companyId,
        unitId,
        baseId,
      } = request.query;

      // Filtros básicos
      const filters: any = {};
      if (name) filters.name = { contains: name };
      if (plateNumber) filters.plateNumber = { contains: plateNumber };
      if (linkingCode) filters.linkingCode = { contains: linkingCode };
      if (baseId) filters.ambulanceBaseId = baseId;

      // Filtros relacionados
      if (unitId || companyId || companyGroupId) {
        filters.ambulanceBase = {
          deletedAt: null,
          ...(unitId && { unitId }),
          ...(companyId && { unit: { companyId } }),
          ...(companyGroupId && { unit: { company: { companyGroupId } } }),
        };
      }

      const [ambulances, total] = await Promise.all([
        prisma.ambulance.findMany({
          where: filters,
          skip: (page - 1) * perPage,
          take: perPage,
          include: {
            ambulanceDocuments: true,
            ambulanceShift: {
              take: 1,
              orderBy: { createdAt: "desc" },
              include: { user: { select: { name: true } } },
            },
            ambulanceStatus: {
              take: 1,
              orderBy: { createdAt: "desc" },
              include: { user: { select: { name: true } } },
            },
          },
        }),
        prisma.ambulance.count({ where: filters }),
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
