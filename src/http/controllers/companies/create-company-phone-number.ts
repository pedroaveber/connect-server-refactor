import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createCompanyPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/companies/:companyId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Create company phone number",
        operationId: "createCompanyPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create company phone number",
        params: z.object({
          companyId: z.string(),
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
        permission: permissions.company.createPhoneNumber,
        target: {
          companyId: request.params.companyId,
        },
      });

      const { companyId } = request.params;
      const newPhone = await prisma.phone.createMany({
        data: request.body.map((phone) => ({
          ...phone,
          companyId,
        })),
      });

      return reply.status(201).send({
        count: newPhone.count,
      });
    }
  );
};
