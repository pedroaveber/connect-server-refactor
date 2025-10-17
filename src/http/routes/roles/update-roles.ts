import { rolesEnum } from "@/data/roles";
import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateRoleSchema = z.object({
  name: z.enum(rolesEnum),
});

const roleIdParam = z.object({ id: z.string() });

export const updateRole: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/roles/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Role"],
        summary: "Update a role",
        params: roleIdParam,
        body: updateRoleSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name } = request.body;

      const role = await prisma.role.findUnique({ where: { id } });
      if (!role) throw new ResourceNotFoundException("Permissão não encontrada.");

      // Checa se já existe outro role com mesmo name
      const existing = await prisma.role.findUnique({ where: { name } });
      if (existing && existing.id !== id) throw new ConflictException("Nome da permissão já está em uso.");

      const updated = await prisma.role.update({ where: { id }, data: { name } });
      return reply.status(200).send({ id: updated.id });
    }
  );
};
