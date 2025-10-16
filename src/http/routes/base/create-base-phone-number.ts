import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const createBasePhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/bases/:baseId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Create base phone number",
        operationId: "createBasePhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create a phone number for a base",
        params: z.object({
          baseId: z.cuid(),
        }),
        body: z.object({
          number: z.string().meta({
            description: "Brazilian phone number (example: +5511999999999)",
          }),
        }),
        response: {
          201: z.object({
            id: z.cuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { baseId } = request.params;
      const { number } = request.body;

      const phone = await prisma.phone.findFirst({
        where: {
          number,
          baseId,
        },
      });

      if (phone) {
        throw new ConflictException("Número de telefone já existe");
      }

      const newPhone = await prisma.phone.create({
        data: {
          number,
          baseId,
        },
      });

      return reply.status(201).send({
        id: newPhone.id,
      });
    }
  );
};
