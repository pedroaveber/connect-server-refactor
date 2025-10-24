import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const updateCompanyModule: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/companies/:companyId/modules/:companyModuleId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Update company module",
        operationId: "updateCompanyModule",
        security: [{ BearerAuth: [] }],
        description: "Update company module",
        params: z.object({
          companyId: z.cuid(),
          companyModuleId: z.cuid(),
        }),
        body: z.object({
          active: z.boolean().optional(),
          customPrice: z.number().optional(),
          quantity: z.number().min(1).optional(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyId, companyModuleId } = request.params;

      const companyModule = await prisma.companyModule.findUnique({
        where: { id: companyModuleId },
      });

      if (!companyModule) {
        throw new ResourceNotFoundException("Módulo da empresa não encontrado");
      }

      await prisma.companyModule.update({
        where: { id: companyModuleId },
        data: request.body,
      });

      return reply.status(204).send(null);
    }
  );
};
