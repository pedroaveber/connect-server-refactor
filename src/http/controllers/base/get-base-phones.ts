import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getBasePhones: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/base/:baseId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get base phones",
        operationId: "getBasePhones",
        security: [{ BearerAuth: [] }],
        description: "Get base phones",
        params: z.object({
          baseId: z.string(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              phones: z.array(
                z.object({
                  id: z.string(),
                  number: z.string(),
                  name: z.string().nullable(),
                  isWhatsapp: z.boolean(),
                  createdAt: z.date(),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.base.read,
        target: {
          baseId: request.params.baseId,
        },
      });

      const { baseId } = request.params;

      const base = await prisma.base.findUnique({
        select: {
          id: true,
          phones: {
            select: {
              id: true,
              number: true,
              name: true,
              isWhatsapp: true,
              createdAt: true,
            },
          },
        },
        where: {
          id: baseId,
        },
      });

      if (!base) {
        throw new ResourceNotFoundException("Base não encontrada");
      }

      return reply.status(200).send({
        data: base,
      });
    }
  );
};
