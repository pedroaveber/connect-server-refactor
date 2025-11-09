import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const updateCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Update company group",
        operationId: "updateCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Update company group",
        params: z.object({
          companyGroupId: z.cuid(),
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
        permission: permissions.companyGroup.update,
        target: {
          companyGroupId: request.params.companyGroupId,
        },
      });

      const { companyGroupId } = request.params;
      const { document, name } = request.body;

      await prisma.companyGroup.update({
        where: {
          id: companyGroupId,
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
