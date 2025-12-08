import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createUnitPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/units/:unitId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Unit"],
        summary: "Create unit phone number",
        operationId: "createUnitPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create unit phone number",
        params: z.object({
          unitId: z.string(),
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
        permission: permissions.unit.createPhoneNumber,
        target: {
          unitId: request.params.unitId,
        },
      });

      const { unitId } = request.params;
      const newPhone = await prisma.phone.createMany({
        data: request.body.map((phone) => ({
          ...phone,
          unitId,
        })),
      });

      return reply.status(201).send({
        count: newPhone.count,
      });
    }
  );
};
