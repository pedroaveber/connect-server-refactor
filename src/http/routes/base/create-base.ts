import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createBaseSchema = z.object({
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  unitId: z.string(),
  phones: z.array(z.object({
    number: z.string(),
  })),
});

export const createBase: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/bases",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Create a new base",
        operationId: "createBase",
        body: createBaseSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { name, unitId, phones, latitude, longitude } = request.body;

      const existing = await prisma.base.findFirst({ where: { name, unitId } });
      if (existing) throw new ConflictException("A base já existe.");

      const base = await prisma.base.create({
        data: {
          latitude,
          longitude,
          name,
          unitId,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      });

      return reply.status(201).send({ id: base.id });
    }
  );
};
