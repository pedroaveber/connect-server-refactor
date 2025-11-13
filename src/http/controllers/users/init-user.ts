import { hash } from "argon2";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { permissions } from "@/data/permissions";
import { randomUUID } from "crypto";

export const initUser: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/users/init",
    {
      schema: {
        tags: ["User"],
        summary: "Create initial user",
        operationId: "createInitialUser",
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (_, reply) => {
      const birthDate = "11/12/1995";
      const password = await hash(birthDate.split("/").join(""));

      const companyGroupId = randomUUID();
      const companyId = randomUUID();
      const unitId = randomUUID();

      const user = await prisma.user.create({
        data: {
          name: "SYS_ADMIN",
          roles: [permissions.sys_admin.accessAll],
          document: "86210262015",
          password,
          birthDate: new Date(birthDate),
          companyGroup: {
            create: {
              id: companyGroupId,
              name: "Prosperapps Inovação e Tecnologia LTDA",
              document: "61779370000163",
            },
          },
          companies: {
            create: {
              id: companyId,
              name: "Matriz Prosperapps",
              document: "61779370000163",
              companyGroupId,
            },
          },
          units: {
            create: {
              id: unitId,
              name: "Desenvolvimento",
              companyGroupId,
              companyId,
            },
          },
        },
      });

      return reply.status(201).send({ id: user.id });
    }
  );
};
