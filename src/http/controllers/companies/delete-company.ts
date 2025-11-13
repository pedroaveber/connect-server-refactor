import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteCompany: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Delete company",
        operationId: "deleteCompany",
        security: [{ BearerAuth: [] }],
        description: "Delete company",
        params: z.object({
          companyId: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.company.delete,
        target: {
          companyId: request.params.companyId,
        },
      });

      const { companyId } = request.params;

      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: { deletedAt: new Date() },
      });

      return reply.status(204).send(null);
    }
  );
};
