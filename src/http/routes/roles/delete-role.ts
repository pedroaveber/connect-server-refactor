import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const roleIdParam = z.object({ id: z.string() });

export const deleteRole: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/roles/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Role"],
        summary: "Delete a role",
        params: roleIdParam,
        response: { 204: z.null() },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const role = await prisma.role.findUnique({ where: { id } });
      if (!role) throw new ResourceNotFoundException("Permissão não encontrada.");

      await prisma.role.delete({ where: { id } });
      return reply.status(204).send();
    }
  );
};
