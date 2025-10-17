import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  birthDate: z.coerce.date().optional(),
  unitIds: z.array(z.string()).optional(), // atualizar unidades do usuário
  roleIds: z.array(z.string()).optional(), // atualizar roles do usuário
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
            name: z.string(),
            document: z.string(),
            avatarUrl: z.string().nullable(),
            birthDate: z.string().pipe(z.coerce.date()),
            units: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
            roles: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
            updatedAt: z.string().pipe(z.coerce.date()),
          }),
          404: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, avatarUrl, birthDate, unitIds, roleIds } = request.body;

      // Verifica se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });
      if (!existingUser) {
        return reply.status(404).send({ message: "User not found" });
      }

      // Atualiza usuário
      const updatedUser = await prisma.user.update({
        where: { id },
        data: {
          name,
          avatarUrl,
          birthDate,
          units: unitIds
            ? { set: unitIds.map((unitId) => ({ id: unitId })) }
            : undefined,
          roles: roleIds
            ? { set: roleIds.map((roleId) => ({ id: roleId })) }
            : undefined,
        },
        include: {
          units: { select: { id: true, name: true } },
          roles: { select: { id: true, name: true } },
        },
      });

      return reply.status(200).send(updatedUser);
    }
  );
};
