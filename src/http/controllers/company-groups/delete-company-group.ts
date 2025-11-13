import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/company-groups/:companyGroupId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Delete company group",
        operationId: "deleteCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Delete company group",
        params: z.object({
          companyGroupId: z.string(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.sys_admin.accessAll,
      });

      const { companyGroupId } = request.params;

      await prisma.companyGroup.update({
        where: {
          id: companyGroupId,
        },
        data: { deletedAt: new Date() },
      });

      return reply.status(204).send(null);
    }
  );
};
