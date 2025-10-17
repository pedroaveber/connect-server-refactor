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
      const { id } = request.params;

      // Verifica se o usuário existe
      const existingUser = await prisma.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        return reply.status(404).send({ message: "User not found" });
      }

      // Soft delete
      const deletedUser = await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return reply.status(200).send({
        id: deletedUser.id,
        deletedAt: deletedUser.deletedAt,
      });
    }
  );
};
