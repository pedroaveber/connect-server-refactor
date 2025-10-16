import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const updateCompanyModules: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/companies/:companyId/modules",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Update company modules",
        operationId: "updateCompanyModules",
        security: [{ BearerAuth: [] }],
        description: "Update company modules",
        params: z.object({
          companyId: z.cuid(),
        }),
        body: z.object({
          companyModules: z.array(
            z.object({
              moduleId: z.cuid(),
              customPrice: z.number().optional(),
              quantity: z.number().min(1).optional(),
              startDate: z.date().optional(),
              endDate: z.date(),
              billingCycle: z.enum(["monthly", "yearly"]).optional(),
              active: z.boolean().optional(),
            })
          ),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params;
      const { companyModules } = request.body;

      const company = await prisma.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada");
      }

      // Substitui os módulos existentes pelos enviados
      await prisma.company.update({
        where: { id: companyId },
        data: {
          companyModule: {
            deleteMany: {},
            createMany: {
              data: companyModules,
            },
          },
        },
      });

      return reply.status(204).send(null);
    }
  );
};
