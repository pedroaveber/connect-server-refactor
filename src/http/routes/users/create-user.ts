import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { auth } from "@/http/hooks/auth";
import { encrypt } from "@/http/hooks/encrypt";
import { hash } from "argon2";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createUserSchema = z.object({
  name: z.string(),
  document: z.string(),
  birthDate: z.string(), // ISO string
  avatarUrl: z.string().optional(),
  unitIds: z.array(z.string()),
  roleIds: z.array(z.string()),
});

export const createUser: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/users",
    {
      preHandler: [auth],
      onSend: [encrypt],
      schema: {
        tags: ["User"],
        summary: "Create user",
        operationId: "createUser",
        body: createUserSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { name, document, birthDate, avatarUrl, unitIds, roleIds } = request.body;

      const existing = await prisma.user.findUnique({ where: { document } });
      if (existing) throw new ConflictException("Usuário já existe");

      const hashPassword = await hash(birthDate.split('/').join(''));

      const user = await prisma.user.create({
        data: {
          name,
          document,
          password: hashPassword,
          birthDate: new Date(birthDate),
          avatarUrl,
          roles: roleIds ? { connect: roleIds.map(id => ({ id })) } : undefined,
          units: unitIds ? { connect: unitIds.map(id => ({ id })) } : undefined,
        },
        select: { id: true },
      });

      return reply.status(201).send({ id: user.id });
    }
  );
};
