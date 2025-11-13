import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const updateCompany: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Update company",
        operationId: "updateCompany",
        security: [{ BearerAuth: [] }],
        description: "Update company",
        params: z.object({
          companyId: z.string(),
        }),
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.company.update,
        target: {
          companyId: request.params.companyId,
        },
      });

      const { companyId } = request.params;
      const { document, name } = request.body;

      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: {
          name,
          document,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
