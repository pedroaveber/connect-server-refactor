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
          birthDate: z.coerce.date(),
          roles: z.array(PermissionSchema),
          companyGroupId: z.string(),
          companiesIds: z.array(z.string()).optional(),
          unitsIds: z.array(z.string()).optional(),
          basesIds: z.array(z.string()).optional(),
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
          birthDate,
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
          bases: basesIds?.length
            ? {
                connect: basesIds.map((id) => ({ id })),
              }
            : undefined,
        },
      });

      return reply.status(201).send({ id: user.id });
    }
  );
};
