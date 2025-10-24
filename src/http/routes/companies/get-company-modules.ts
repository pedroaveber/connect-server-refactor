import { moduleBillingTypeEnum } from "@/data/module-billing-type";
import { moduleNamesEnum } from "@/data/modules-names";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getCompanyModules: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/companies/:companyId/modules",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Get company modules",
        operationId: "getCompanyModules",
        security: [{ BearerAuth: [] }],
        description: "Get company modules",
        params: z.object({
          companyId: z.cuid(),
        }),
        response: {
          200: z.object({
            data: z.array(z.object({
              id: z.cuid(),
              customPrice: z.number().nullable(),
              quantity: z.number().nullable(),
              active: z.boolean(),
              contractedAt: z.date(),
              module: z.object({
                id: z.cuid(),
                name: z.string(),
                description: z.string().nullable(),
                billingType: z.string(),
                defaultPrice: z.number(),
              }),
            }))
          })
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params;

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada");
      }

      const companyModules = await 
        prisma.companyModule.findMany({
          where: {
            companyId: company.id,
          },
          include: {
            module: true,
          },
        });

      return reply.status(200).send({
        data: companyModules,
      });
    }
  );
};
