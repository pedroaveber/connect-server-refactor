import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";
import { zodAmbulanceStatusEnum } from "@/utils/zod";
import { MessageType, Platform } from "@prisma/client";

export const getChats: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/chats",
    {
      preHandler: [auth],
      schema: {
        tags: ["Chat"],
        summary: "Get chats",
        operationId: "getChats",
        security: [{ BearerAuth: [] }],
        description: "Get chats",
        querystring: z
          .object({
            name: z.string().optional(),
            unitsId: z.array(z.string()).optional(),
            companiesId: z.array(z.string()).optional(),
            companyGroupId: z.string().optional(),
            status: z.array(zodAmbulanceStatusEnum).optional(),
            platform: z.enum(Platform),
          })
          .refine(
            (data) =>
              [data.companyGroupId, data.companiesId, data.unitsId].filter(
                Boolean
              ).length === 1,
            {
              message:
                "Informe apenas um dos campos: 'companyGroupId', 'companiesId' ou 'unitsId'",
              path: ["companyGroupId"], // o campo onde o erro será exibido
            }
          ),
        response: {
          200: z.object({
            data: z.array(
              z.object({
                id: z.string(),
                readByAppAt: z.date().nullable(),
                readByWebAt: z.date().nullable(),
                lastMessageAt: z.date().nullable(),
                unreadCountApp: z.number(),
                unreadCountWeb: z.number(),

                ambulance: z.object({
                  id: z.string(),
                  name: z.string(),
                  status: zodAmbulanceStatusEnum,
                  baseId: z.string(),
                  unitId: z.string(),
                }),
                messages: z
                  .array(
                    z.object({
                      id: z.string(),
                      content: z.string().nullable(),
                      messageType: z.enum(MessageType),
                      createdAt: z.date(),
                    })
                  )
                  .nullable(),
              })
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.chat.read,
        target: {
          companyGroupId: request.query.companyGroupId,
          companyId: request.query.companiesId,
          unitId: request.query.unitsId,
        },
      });
      const { name, companyGroupId, companiesId, unitsId, status } =
        request.query;

      const [chats] = await Promise.all([
        prisma.chats.findMany({
          include: {
            ambulance: {
              select: {
                id: true,
                name: true,
                status: true,
                baseId: true,
                unitId: true,
              },
            },
            messages: {
              select: {
                id: true,
                content: true,
                messageType: true,
                createdAt: true,
              },
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
          where: {
            ambulance: {
              name: {
                contains: name,
                mode: "insensitive",
              },
              status: status && status.length > 0 ? { in: status } : undefined,
              companyGroupId: companyGroupId ? companyGroupId : undefined,
              company:
                companiesId && companiesId.length > 0
                  ? { id: { in: companiesId } }
                  : undefined,
              unitId:
                unitsId && unitsId.length > 0 ? { in: unitsId } : undefined,
            },
            deletedAt: null,
          },
          orderBy: {
            createdAt: "desc",
          },
        }),
      ]);

      return reply.status(200).send({
        data: chats,
      });
    }
  );
};
