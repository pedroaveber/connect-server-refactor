import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getUnitPhones: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/units/:unitId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Get units phones",
        operationId: "getUnitsPhones",
        security: [{ BearerAuth: [] }],
        description: "Get unit phones",
        params: z.object({
          unitId: z.string(),
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
        permission: permissions.unit.read,
        target: {
          unitId: request.params.unitId,
        },
      });

      const { unitId } = request.params;

      const unitPhones = await prisma.unit.findUnique({
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
          id: unitId,
        },
      });

      if (!unitPhones) {
        throw new ResourceNotFoundException("Unidade não encontrada");
      }

      return reply.status(200).send({
        data: unitPhones,
      });
    }
  );
};
