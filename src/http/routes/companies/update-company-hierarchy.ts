import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const updateCompanyHierarchy: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/companies/:companyId/hierarchy",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Update company hierarchy",
        operationId: "updateCompanyHierarchy",
        security: [{ BearerAuth: [] }],
        description: "Update company hierarchy",
        params: z.object({
          companyId: z.cuid(),
        }),
        body: z.object({
          companyGroupId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params;
      const { companyGroupId } = request.body;

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada");
      }

      const companyGroup = await prisma.companyGroup.findUnique({
        where: {
          id: companyGroupId,
        },
      });

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado");
      }

      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: {
          companyGroupId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
