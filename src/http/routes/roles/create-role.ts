import { rolesEnum } from "@/data/roles";
import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createRoleSchema = z.object({
  name: z.enum(rolesEnum),
});

export const createRole: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/roles",
    {
      preHandler: [auth],
      schema: {
        tags: ["Role"],
        summary: "Create a new role",
        operationId: "createRole",
        body: createRoleSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { name } = request.body;

      // Verifica duplicidade
      const existing = await prisma.role.findUnique({ where: { name } });
      if (existing) throw new ConflictException("Essa permissão já existe.");

      const role = await prisma.role.create({ data: { name } });
      return reply.status(201).send({ id: role.id });
    }
  );
};
