import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { zodAmbulanceStatusEnum } from "@/utils/zod";
import { permissions } from "@/data/permissions";

export const getAmbulance: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulance by ID",
        params: z.object({ id: z.string() }),
        operationId: "getAmbulance",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              status: zodAmbulanceStatusEnum,
              observations: z.string().nullable(),
              licensePlate: z.string(),
              ambulanceCode: z.string(),
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
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
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
        },
      });

      request.authorize({
        permission: permissions.ambulance.read,
        target: {
          baseId: ambulance?.baseId,
        },
      });

      return reply.status(200).send({
        data: ambulance!,
      });
    }
  );
};
