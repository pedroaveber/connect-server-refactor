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
          companyId: z.cuid(),
        }),
        body: z.object({
          name: z.string().optional(),
          isWhatsapp: z.boolean().optional(),
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
        permission: permissions.company.createPhoneNumber,
        target: {
          companyId: request.params.companyId,
        },
      });

      const { companyId } = request.params;
      const { name, isWhatsapp, number } = request.body;

      const newPhone = await prisma.phone.create({
        data: {
          number,
          companyId,
          name,
          isWhatsapp,
        },
      });

      return reply.status(201).send({
        id: newPhone.id,
      });
    }
  );
};
