import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const updateUnitHierarchy: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/units/:unitId/hierarchy",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Update unit hierarchy",
        operationId: "updateUnitHierarchy",
        security: [{ BearerAuth: [] }],
        description: "Update unit hierarchy",
        params: z.object({
          unitId: z.cuid(),
        }),
        body: z.object({
          companyId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { unitId } = request.params;
      const { companyId } = request.body;

      const unit = await prisma.unit.findUnique({
        where: {
          id: unitId,
        },
      });
      
      if (!unit) {
        throw new ResourceNotFoundException("Unidade não encontrada");
      }

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada");
      }
      
      await prisma.unit.update({
        where: {
          id: unitId,
        },
        data: {
          companyId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
