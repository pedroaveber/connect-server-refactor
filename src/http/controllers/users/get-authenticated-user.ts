import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { Permission, PermissionSchema } from "@/data/permissions";

export const getAuthenticatedUser: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users/me",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get authenticated user",
        security: [{ BearerAuth: [] }],
        operationId: "getAuthenticatedUser",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              document: z.string(),
              avatarUrl: z.string().nullable(),
              birthDate: z.date(),
              roles: z.array(PermissionSchema),
              createdAt: z.date(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          document: true,
          avatarUrl: true,
          birthDate: true,
          createdAt: true,
          roles: true,
        },
      });

      if (!user) {
        throw new ResourceNotFoundException("Usuário não encontrado");
      }

      return reply.status(200).send({
        data: {
          ...user,
          roles: user.roles as Permission[],
        },
      });
    }
  );
};
