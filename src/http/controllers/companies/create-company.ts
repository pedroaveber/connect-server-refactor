import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const createCompany: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/companies",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Create company",
        operationId: "createCompany",
        security: [{ BearerAuth: [] }],
        description: "Create company",
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
          companyGroupId: z.cuid().meta({
            description: "Company group ID",
          }),
          phones: z.array(
            z.object({
              name: z.string().optional(),
              isWhatsapp: z.boolean().optional(),
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
        permission: permissions.company.create,
        target: {
          companyGroupId: request.body.companyGroupId,
        },
      });

      const { document, name, phones, companyGroupId } = request.body;

      const company = await prisma.company.create({
        data: {
          document,
          name,
          companyGroupId,
          phones: {
            createMany: {
              data: phones,
            },
          },
        },
      });

      return reply.status(201).send({
        id: company.id,
      });
    }
  );
};
