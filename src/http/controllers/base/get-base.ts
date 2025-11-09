import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getBase: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get base",
        operationId: "getBase",
        security: [{ BearerAuth: [] }],
        description: "Get base",
        params: z.object({
          id: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              document: z.string().nullable(),
              latitude: z.number().nullable(),
              longitude: z.number().nullable(),
              createdAt: z.date(),
              updatedAt: z.date(),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  isWhatsapp: z.boolean(),
                  name: z.string().nullable(),
                  createdAt: z.date(),
                })
              ),
              unit: z.object({
                id: z.cuid(),
                name: z.string(),
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
          }),
        },
      },
    },
    async (request, reply) => {
      await request.authorize({
        permission: permissions.base.read,
        target: { baseId: request.params.id },
      });
      const { id } = request.params;

      const base = await prisma.base.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          latitude: true,
          document: true,
          longitude: true,
          createdAt: true,
          updatedAt: true,
          phones: {
            select: {
              id: true,
              number: true,
              isWhatsapp: true,
              name: true,
              createdAt: true,
            },
          },
          unit: {
            select: {
              id: true,
              name: true,
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
            },
          },
        },
      });

      if (!base) {
        throw new ResourceNotFoundException("Base not found");
      }

      return reply.status(200).send({
        data: base,
      });
    }
  );
};
