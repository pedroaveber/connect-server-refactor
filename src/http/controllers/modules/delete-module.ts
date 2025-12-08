import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteModules: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/modules/:moduleId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Delete module",
        operationId: "deleteModule",
        security: [{ BearerAuth: [] }],
        description: "Delete module",
        params: z.object({
          moduleId: z.string(),
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

      const { moduleId } = request.params;

      await prisma.modules.delete({
        where: {
          id: moduleId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
