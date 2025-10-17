import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getBase: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/bases/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Get base by ID",
        operationId: "getBase",
        params: z.object({ id: z.cuid() }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
            latitude: z.number(),
            longitude: z.number(),
            createdAt: z.string().pipe(z.coerce.date()),
            updatedAt: z.string().pipe(z.coerce.date()),
            deletedAt: z.string().pipe(z.coerce.date()).nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const base = await prisma.base.findUnique({ where: { id } });
      if (!base) throw new ResourceNotFoundException("Base não encontrada.");

      return reply.send(base);
    }
  );
};
