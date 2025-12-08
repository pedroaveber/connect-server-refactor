import { permissions, PermissionSchema } from "@/data/permissions";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().optional(),
  document: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  birthDate: z.coerce.date().optional(),
  companyGroupId: z.string().optional(),
  companiesIds: z.array(z.string()).optional(), // atualizar empresas do usuário
  unitsIds: z.array(z.string()).optional(), // atualizar unidades do usuário
  roleIds: z.array(PermissionSchema).optional(), // atualizar roles do usuário
});

export const updateUser: FastifyPluginCallbackZod = (app) => {
  app.patch(
    "/users/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Update a user's data",
        security: [{ BearerAuth: [] }],
        operationId: "updateUser",
        params: z.object({ id: z.string() }),
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
      request.authorize({
        permission: permissions.user.read,
        target: {
          companyGroupId: request.body.companyGroupId,
        },
      });

      const { id } = request.params;
      const { name, avatarUrl, document, birthDate, unitsIds, roleIds } =
        request.body;

      // Atualiza usuário
      const updatedUser = await prisma.user.update({
        select: {
          id: true,
        },
        where: { id },
        data: {
          name,
          avatarUrl,
          birthDate,
          document,
          units: unitsIds
            ? { set: unitsIds.map((unitId) => ({ id: unitId })) }
            : undefined,
          roles: roleIds,
        },
      });

      return reply.status(200).send(updatedUser);
    }
  );
};
