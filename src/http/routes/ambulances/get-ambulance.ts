import { ambulanceStatusEnum } from "@/data/ambulance-status";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getAmbulance: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulance by ID",
        params: z.object({ id: z.cuid() }),
        operationId: "getAmbulance",
        response: {
          200: z.object({
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
                validUntil: z.string().pipe(z.coerce.date()).nullable(),
              })
            ),
            ambulanceShift: z.array(
              z.object({
                startDate: z.string().pipe(z.coerce.date()),
                endDate: z.string().pipe(z.coerce.date()),
                user: z.object({
                  name: z.string().nullable(),
                }).nullable(),
              })
            ),
            ambulanceStatus: z.array(
              z.object({
                status: z.enum(ambulanceStatusEnum),
                user: z.object({
                  name: z.string().nullable(),
                }).nullable(),
              })
            ),
            ambulanceDestinationCommands: z.array(
              z.object({
                latitude: z.number().nullable(),
                longitude: z.number().nullable(),
                address: z.string().nullable(),
                base: z
                  .object({
                    name: z.string(),
                    latitude: z.number(),
                    longitude: z.number(),
                  })
                  .nullable(),
                attended: z.boolean().nullable(),
                attendedAt: z.string().pipe(z.coerce.date()).nullable(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const ambulance = await prisma.ambulance.findUnique({
        where: { id },
        include: {
          ambulanceDocuments: {
            select: {
              id: true,
              documentTitle: true,
              documentType: true,
              documentUrl: true,
              validUntil: true,
            },
          },
          ambulanceShift: {
            select: {
              startDate: true,
              endDate: true,
              user: { select: { name: true } },
            },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          ambulanceStatus: {
            select: {
              status: true,
              user: { select: { name: true } },
            },
            take: 1,
            orderBy: { createdAt: "desc" },
          },
          ambulanceDestinationCommands: {
            select: {
              latitude: true,
              longitude: true,
              address: true,
              base: {
                select: { name: true, latitude: true, longitude: true },
              },
              attended: true,
              attendedAt: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!ambulance)
        throw new ResourceNotFoundException("Ambulância não encontrada");

      return reply.send(ambulance);
    }
  );
};
