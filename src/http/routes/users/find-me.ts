import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const findMe: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/users",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Find me",
        security: [{ BearerAuth: [] }],
        operationId: "findMe",
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            document: z.string(),
            avatarUrl: z.string().nullable(),
            birthDate: z.date(),
            units: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                company: z.object({
                  id: z.string(),
                  name: z.string(),
                  companyGroup: z.object({
                    id: z.string(),
                    name: z.string(),
                  }),
                }),
              })
            ),
            roles: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
              })
            ),
            createdAt: z.date(),
            updatedAt: z.date(),
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
          updatedAt: true,
          units: {
            select: {
              id: true,
              name: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  companyGroup: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          roles: { select: { id: true, name: true } },
        },
      });

      if (!user) {
        throw new ResourceNotFoundException("Usuário não encontrado");
      }

      return reply.status(200).send(user);
    }
  );
};
