import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";

export const getAmbulancePhones: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulance phones by ID",
        params: z.object({ id: z.string() }),
        operationId: "getAmbulancePhones",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              companyGroup: z.object({
                phones: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string().nullable(),
                    number: z.string(),
                    isWhatsapp: z.boolean(),
                  })
                ),
              }),
              company: z.object({
                phones: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string().nullable(),
                    number: z.string(),
                    isWhatsapp: z.boolean(),
                  })
                ),
              }),
              unit: z.object({
                phones: z.array(
                  z.object({
                    id: z.string(),
                    name: z.string().nullable(),
                    number: z.string(),
                    isWhatsapp: z.boolean(),
                  })
                ),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
        select: {
          id: true,
          unitId: true,
          companyGroup: {
            select: {
              phones: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                  isWhatsapp: true,
                },
              },
            },
          },
          company: {
            select: {
              phones: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                  isWhatsapp: true,
                },
              },
            },
          },
          unit: {
            select: {
              phones: {
                select: {
                  id: true,
                  name: true,
                  number: true,
                  isWhatsapp: true,
                },
              },
            },
          },
        },
      });

      request.authorize({
        // permission: permissions.ambulance.read,
        target: {
          unitId: ambulance?.unitId,
        },
      });

      return reply.status(200).send({
        data: ambulance!,
      });
    }
  );
};
