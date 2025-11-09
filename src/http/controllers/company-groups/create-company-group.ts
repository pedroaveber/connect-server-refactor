import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createCompanyGroup: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/company-groups",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Create company group",
        operationId: "createCompanyGroup",
        security: [{ BearerAuth: [] }],
        description: "Create company group",
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          phones: z.array(
            z.object({
              isWhatsapp: z.boolean().optional().default(false),
              name: z.string().optional(),
              number: z.string().meta({
                description: "Brazilian phone number (example: +5511999999999)",
              }),
            })
          ),
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
        permission: permissions.sys_admin.accessAll,
      });

      const { document, name, phones } = request.body;

      const companyGroup = await prisma.companyGroup.create({
        data: {
          document,
          name,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      });

      return reply.status(201).send({
        id: companyGroup.id,
      });
    }
  );
};
