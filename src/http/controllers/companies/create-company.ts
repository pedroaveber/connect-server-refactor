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
          companyGroupId: z.string().meta({
            description: "Company group ID",
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
      request.authorize({
        permission: permissions.company.create,
        target: {
          companyGroupId: request.body.companyGroupId,
        },
      });

      const { document, name, companyGroupId } = request.body;

      const modules = await prisma.modules.findMany();

      const company = await prisma.company.create({
        data: {
          document,
          name,
          companyGroupId,
        },
      });

      await prisma.companyModules.createMany({
        data: modules.map((module) => ({
          companyId: company.id,
          moduleId: module.id,
          active: false,
        })),
      });

      return reply.status(201).send({
        id: company.id,
      });
    }
  );
};
