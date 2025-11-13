import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

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
          baseId: z.string(),
        }),
        body: z.object({
          isWhatsapp: z.boolean().default(false),
          name: z.string().optional(),
          number: z.string().meta({
            description: "Brazilian phone number (example: +5511999999999)",
          }),
        }),
        response: {
          201: z.object({
            id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      await request.authorize({
        target: {
          baseId: request.params.baseId,
        },
        permission: permissions.base.createPhoneNumber,
      });

      const { baseId } = request.params;
      const { number, isWhatsapp, name } = request.body;

      const newPhone = await prisma.phone.create({
        data: {
          name,
          baseId,
          number,
          isWhatsapp,
        },
      });

      return reply.status(201).send({
        id: newPhone.id,
      });
    }
  );
};
