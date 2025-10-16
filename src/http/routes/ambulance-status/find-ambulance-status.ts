import { ambulanceStatusEnum } from "@/data/ambulance-status";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const getAmbulanceStatuses: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id/statuses",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceStatus"],
        summary: "Get statuses for an ambulance",
        operationId: "getAmbulanceStatuses",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          take: z.coerce.number().int().min(1).default(1),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                status: z.enum(ambulanceStatusEnum),
                user: z.object({ id: z.string(), name: z.string() }).nullable(),
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
      const { id: ambulanceId } = request.params;
      const { page, take } = request.query;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id: ambulanceId },
      });
      if (!ambulance)
        throw new ResourceNotFoundException("Ambulância não encontrada");

      const [statuses, total] = await Promise.all([
        prisma.ambulanceStatus.findMany({
          where: { ambulanceId },
          skip: (page - 1) * take,
          take,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { id: true, name: true } } },
        }),
        prisma.ambulanceStatus.count({ where: { ambulanceId } }),
      ]);

      const totalPages = Math.ceil(total / take);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return reply.status(200).send({
        data: statuses,
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
