import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getCompany: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get company",
        operationId: "getCompany",
        security: [{ BearerAuth: [] }],
        description: "Get company",
        params: z.object({
          companyId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.cuid(),
              name: z.string(),
              document: z.string(),
              companyGroupId: z.cuid(),
              unitsCount: z.number(),
              createdAt: z.date(),
              updatedAt: z.date(),
              companyGroup: z.object({
                id: z.cuid(),
                name: z.string(),
                document: z.string(),
              }),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  name: z.string().nullable(),
                  isWhatsapp: z.boolean(),
                  number: z.string(),
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
        permission: permissions.company.read,
        target: {
          companyId: request.params.companyId,
        },
      });
      const { companyId } = request.params;

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        select: {
          id: true,
          name: true,
          document: true,
          companyGroupId: true,
          createdAt: true,
          updatedAt: true,
          companyGroup: {
            select: {
              id: true,
              name: true,
              document: true,
            },
          },
          phones: {
            select: {
              id: true,
              number: true,
              name: true,
              isWhatsapp: true,
              createdAt: true,
            },
          },
          _count: {
            select: {
              units: true,
            },
          },
        },
      });

      return reply.status(200).send({
        data: {
          ...company!,
          unitsCount: company?._count.units || 0,
        },
      });
    }
  );
};
