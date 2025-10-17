import { rolesEnum } from "@/data/roles";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import z from "zod";

export const getRoles: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/roles",
    {
      preHandler: [auth],
      schema: {
        tags: ["Role"],
        summary: "Get all roles",
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              name: z.enum(rolesEnum),
              createdAt: z.date(),
              updatedAt: z.date(),
            })
          ),
        },
      },
    },
    async (_, reply) => {
      const roles = await prisma.role.findMany();
      return reply.status(200).send(roles);
    }
  );
};
