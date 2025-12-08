import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createBasePhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/base/:baseId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Create base phone number",
        operationId: "createBasePhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create base phone number",
        params: z.object({
          baseId: z.string(),
        }),
        body: z.array(
          z.object({
            name: z
              .string()
              .meta({
                description: "Phone name",
              })
              .optional(),
            isWhatsapp: z
              .boolean()
              .meta({
                description: "Is whatsapp",
              })
              .optional()
              .default(false),
            number: z.string().meta({
              description: "Brazilian phone number (example: +5511999999999)",
            }),
          })
        ),
        response: {
          201: z.object({
            count: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.base.createPhoneNumber,
        target: {
          baseId: request.params.baseId,
        },
      });

      const { baseId } = request.params;
      const newPhone = await prisma.phone.createMany({
        data: request.body.map((phone) => ({
          ...phone,
          baseId,
        })),
      });

      return reply.status(201).send({
        count: newPhone.count,
      });
    }
  );
};
