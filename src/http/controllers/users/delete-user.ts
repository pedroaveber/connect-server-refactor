import { permissions } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteUser: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/users/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Soft delete a user",
        security: [{ BearerAuth: [] }],
        operationId: "deleteUser",
        params: z.object({ id: z.string() }),
        body: z.object({ companyGroupId: z.string() }),
        response: {
          200: z.object({
            id: z.string(),
            deletedAt: z.date().nullable(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.user.delete,
        target: {
          companyGroupId: request.body.companyGroupId,
        },
      });

      const { id } = request.params;

      // Soft delete
      const deletedUser = await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date(), document: "" },
      });

      return reply.status(200).send({
        id: deletedUser.id,
        deletedAt: deletedUser.deletedAt,
      });
    }
  );
};
