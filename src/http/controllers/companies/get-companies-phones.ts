import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getCompaniesPhones: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies/:companyId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get company phones",
        operationId: "getCompaniesPhones",
        security: [{ BearerAuth: [] }],
        description: "Get company phones",
        params: z.object({
          companyId: z.string(),
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
        permission: permissions.company.read,
        target: {
          companyId: request.params.companyId,
        },
      });

      const { companyId } = request.params;

      const company = await prisma.company.findUnique({
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
          id: companyId,
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
