import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

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
              createdAt: z.string().pipe(z.coerce.date()),
              updatedAt: z.string().pipe(z.coerce.date()),
              deletedAt: z.string().pipe(z.coerce.date()).nullable(),
              phones: z.array(
                z.object({
                  id: z.cuid(),
                  number: z.string(),
                  createdAt: z.string().pipe(z.coerce.date()),
                  updatedAt: z.string().pipe(z.coerce.date()),
                })
              ),
              companyModule: z.array(
                z.object({
                  id: z.cuid(),
                  customPrice: z.number().nullable(),
                  quantity: z.number().nullable(),
                  startDate: z.string().pipe(z.coerce.date()),
                  endDate: z.string().pipe(z.coerce.date()).nullable(),
                  billingCycle: z.string(),
                  active: z.boolean(),
                  contractedAt: z.string().pipe(z.coerce.date()),
                  module: z.object({
                    id: z.cuid(),
                    name: z.string(),
                    description: z.string().nullable(),
                    billingType: z.string(),
                    defaultPrice: z.number(),
                  }),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params;

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
        include: {
          phones: true,
          companyModule: {
            select: {
              id: true,
              customPrice: true,
              quantity: true,
              startDate: true,
              endDate: true,
              billingCycle: true,
              active: true,
              contractedAt: true,
              module: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                  billingType: true,
                  defaultPrice: true,
                },
              },
            },
          },
        },
      });

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada");
      }

      return reply.status(200).send({
        data: company,
      });
    }
  );
};
