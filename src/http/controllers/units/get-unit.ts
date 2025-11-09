import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getUnit: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/units/:unitId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Get unit",
        operationId: "getUnit",
        security: [{ BearerAuth: [] }],
        description: "Get unit",
        params: z.object({
          unitId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.cuid(),
              name: z.string(),
              basesCount: z.number(),
              createdAt: z.date(),
              updatedAt: z.date(),
              company: z.object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
                companyGroup: z.object({
                  id: z.cuid(),
                  name: z.string(),
                  document: z.string(),
                }),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.unit.read,
        target: {
          unitId: request.params.unitId,
        },
      });

      const { unitId } = request.params;

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          updatedAt: true,
          company: {
            select: {
              id: true,
              name: true,
              document: true,
              companyGroup: {
                select: {
                  id: true,
                  name: true,
                  document: true,
                },
              },
            },
          },
          _count: {
            select: {
              bases: true,
            },
          },
        },
      });

      return reply.status(200).send({
        data: {
          ...unit!,
          basesCount: unit!._count.bases,
        },
      });
    }
  );
};
