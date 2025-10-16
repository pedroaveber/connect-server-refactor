import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getDestinationCommands: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:ambulanceId/destination-commands",
    {
      preHandler: [auth],
      schema: {
        tags: ["AmbulanceDestinationCommands"],
        summary: "List destination commands of an ambulance",
        operationId: "getDestinationCommands",
        params: z.object({ ambulanceId: z.cuid() }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          perPage: z.coerce.number().int().min(1).default(10),
        }),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                latitude: z.number().nullable(),
                longitude: z.number().nullable(),
                address: z.string().nullable(),
                baseId: z.string().nullable(),
                attended: z.boolean().nullable(),
                attendedAt: z.date().nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
                user: z.object({ id: z.string(), name: z.string() }),
                base: z.object({ id: z.string(), name: z.string() }).nullable(),
                ambulance: z.object({ id: z.string(), name: z.string() }).nullable(),
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
      const { ambulanceId } = request.params;
      const { page, perPage } = request.query;

      const [commands, total] = await Promise.all([
        prisma.ambulanceDestinationCommands.findMany({
          where: { ambulanceId, deletedAt: null },
          include: {
            user: { select: { id: true, name: true } },
            base: { select: { id: true, name: true } },
            ambulance: { select: { id: true, name: true } },
          },
          skip: (page - 1) * perPage,
          take: perPage,
          orderBy: { createdAt: "desc" },
        }),
        prisma.ambulanceDestinationCommands.count({ where: { ambulanceId, deletedAt: null } }),
      ]);

      const totalPages = Math.ceil(total / perPage);

      return reply.status(200).send({
        data: commands,
        pagination: {
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
          currentPage: page,
        },
      });
    }
  );
};
