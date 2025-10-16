import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateBaseSchema = z.object({
  name: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const updateBase: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/bases/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Update base",
        operationId: "updateBase",
        params: z.object({ id: z.cuid() }),
        body: updateBaseSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { name, latitude, longitude } = request.body;

      const base = await prisma.base.findUnique({ where: { id } });
      if (!base) throw new ResourceNotFoundException("Base não encontrada.");

      const updated = await prisma.base.update({
        where: { id },
        data: { name, latitude, longitude },
      });

      return reply.send({ id: updated.id });
    }
  );
};
