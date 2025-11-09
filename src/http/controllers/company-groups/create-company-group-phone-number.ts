import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createCompanyGroupPhoneNumber: FastifyPluginCallbackZod = (
  app
) => {
  app.post(
    "/company-groups/:companyGroupId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Create company group phone number",
        operationId: "createCompanyGroupPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Create company group phone number",
        params: z.object({
          companyGroupId: z.cuid(),
        }),
        body: z.object({
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
        }),
        response: {
          201: z.object({
            id: z.cuid(),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.companyGroup.createPhoneNumber,
        target: {
          companyGroupId: request.params.companyGroupId,
        },
      });

      const { companyGroupId } = request.params;
      const { number, name, isWhatsapp } = request.body;

      const newPhone = await prisma.phone.create({
        data: {
          name,
          number,
          isWhatsapp,
          companyGroupId,
        },
      });

      return reply.status(201).send({
        id: newPhone.id,
      });
    }
  );
};
