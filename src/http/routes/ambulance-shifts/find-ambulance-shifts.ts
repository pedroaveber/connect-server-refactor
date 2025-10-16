import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getAmbulanceShifts: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id/shifts",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceShift"],
        summary: "Get shifts for an ambulance",
        operationId: "getAmbulanceShifts",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          take: z.coerce.number().int().min(1).default(1), // quantos registros receber
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                startDate: z.date(),
                endDate: z.date(),
                user: z.object({ id: z.string(), name: z.string() }).nullable(),
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
      const { id: ambulanceId } = request.params;
      const { page, take } = request.query;

      // Verifica se a ambulância existe
      const ambulance = await prisma.ambulance.findUnique({
        where: { id: ambulanceId },
      });
      if (!ambulance) throw new ResourceNotFoundException("Ambulância não encontrada");

      // Busca turnos com paginação
      const [shifts, total] = await Promise.all([
        prisma.ambulanceShift.findMany({
          where: { ambulanceId, deletedAt: null },
          skip: (page - 1) * take,
          take,
          orderBy: { startDate: "desc" },
          include: { user: { select: { id: true, name: true } } },
        }),
        prisma.ambulanceShift.count({ where: { ambulanceId, deletedAt: null } }),
      ]);

      const totalPages = Math.ceil(total / take);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: shifts,
        pagination: { total, totalPages, hasNextPage, hasPreviousPage, currentPage: page },
      });
    }
  );
};
