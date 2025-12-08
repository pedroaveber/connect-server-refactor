import { PermissionSchema } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateUserSchema = z.object({
  id: z.string(),
  roleIds: z.array(PermissionSchema).optional(), // atualizar roles do usuário
});

export const updateUserPermissions: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/users/permissions",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Update a user permissions",
        security: [{ BearerAuth: [] }],
        operationId: "updateUserPermissions",
        body: updateUserSchema,
        response: {
          200: z.object({
            id: z.string(),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      // request.authorize({
      //   permission: permissions.user.read,
      //   // target: {
      //   //   companyGroupId: request.body.companyGroupId,
      //   // },
      // });
      const { id, roleIds } = request.body;

      // Atualiza usuário
      const updatedUser = await prisma.user.update({
        select: {
          id: true,
        },
        where: { id },
        data: {
          roles: roleIds,
        },
      });

      return reply.status(200).send(updatedUser);
    }
  );
};
