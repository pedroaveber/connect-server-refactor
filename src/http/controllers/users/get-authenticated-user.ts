import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { Permission, PermissionSchema } from "@/data/permissions";
import { UnauthorizedException } from "@/http/exceptions/unauthorized-exception";

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
              roles: z.array(PermissionSchema),
              companyGroup: z
                .object({
                  id: z.string(),
                  name: z.string(),
                })
                .nullable(),
              companies: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                })
              ),
              units: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                })
              ),
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
          roles: true,
          companyGroup: {
            select: {
              id: true,
              name: true,
            },
          },
          companies: {
            select: {
              id: true,
              name: true,
            },
          },
          units: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException("Usuário não encontrado");
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
