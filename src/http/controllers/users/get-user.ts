import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { Permission, permissions, PermissionSchema } from "@/data/permissions";

export const getUser: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/user/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get user by ID",
        security: [{ BearerAuth: [] }],
        operationId: "getUser",
        params: z.object({ id: z.string() }),
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              document: z.string().nullable(),
              avatarUrl: z.string().nullable(),
              birthDate: z.date(),
              createdAt: z.date(),
              roles: z.array(PermissionSchema),
              companyGroupId: z.string().nullable(),
              companies: z.array(
                z.object({
                  id: z.string(),
                })
              ),
              units: z.array(
                z.object({
                  id: z.string(),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.user.read,
      });
      const { id } = request.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          document: true,
          avatarUrl: true,
          birthDate: true,
          createdAt: true,
          roles: true,
          companyGroupId: true,
          companies: {
            select: {
              id: true,
            },
          },
          units: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!user) return;

      return reply.status(200).send({
        data: {
          ...user,
          roles: user.roles as Permission[],
        },
      });
    }
  );
};
