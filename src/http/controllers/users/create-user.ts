import { hash } from "argon2";
import dayjs from "dayjs";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions, PermissionSchema } from "@/data/permissions";

export const createUser: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/users",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Create user",
        operationId: "createUser",
        body: z.object({
          name: z.string(),
          document: z.string(),
          birthDate: z.string(),
          roles: z.array(PermissionSchema),
          companyGroupId: z.cuid(),
          companiesIds: z.array(z.cuid()).optional(),
          unitsIds: z.array(z.cuid()).optional(),
          basesIds: z.array(z.cuid()).optional(),
        }),
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      // TODO - Pensar se será mantido somente o companyGroupId como target
      request.authorize({
        permission: permissions.user.create,
        target: {
          companyGroupId: request.body.companyGroupId,
        },
      });

      const {
        name,
        document,
        birthDate,
        roles,
        basesIds,
        companiesIds,
        companyGroupId,
        unitsIds,
      } = request.body;

      const password = await hash(dayjs(birthDate).format("DDMMYYYY"));

      const user = await prisma.user.create({
        data: {
          name,
          roles,
          document,
          password,
          birthDate: new Date(birthDate),
          companyGroup: {
            connect: {
              id: companyGroupId,
            },
          },
          companies: {
            connect: companiesIds?.map((id) => ({ id })),
          },
          units: {
            connect: unitsIds?.map((id) => ({ id })),
          },
          bases: {
            connect: basesIds?.map((id) => ({ id })),
          },
        },
      });

      return reply.status(201).send({ id: user.id });
    }
  );
};
