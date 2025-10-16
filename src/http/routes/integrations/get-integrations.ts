import { externalIntegrationsEnum } from "@/data/external-integration";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const querySchema = z
  .object({
    companyGroupId: z.string().optional(),
    companyId: z.string().optional(),
    type: z.enum(externalIntegrationsEnum).optional(),
  })
  .refine(
    (data) => {
      return data.companyGroupId || data.companyId;
    },
    {
      message: "Você deve passar companyGroupId ou companyId",
    }
  );

export const getIntegrations: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/integrations",
    {
      preHandler: [auth],
      schema: {
        tags: ["Integration"],
        summary: "List integrations",
        operationId: "getIntegrations",
        security: [{ BearerAuth: [] }],
        querystring: querySchema,
        response: {
          200: z.array(
            z.object({
              id: z.string(),
              type: z.enum(externalIntegrationsEnum),
              url: z.string().nullable(),
              login: z.string().nullable(),
              password: z.string().nullable(),
              apiKey: z.string().nullable(),
              config: z.any().nullable(),
              createdAt: z.date(),
              updatedAt: z.date(),
              companyGroup: z.object({ id: z.string(), name: z.string() }),
              companies: z.array(
                z.object({ id: z.string(), name: z.string() })
              ),
            })
          ),
        },
      },
    },
    async (request, reply) => {
      const { companyGroupId, companyId, type } = request.query;

      const where: any = {};
      if (companyGroupId) where.companyGroupId = companyGroupId;
      if (type) where.type = type;
      if (companyId) where.companies = { some: { id: companyId } };

      const integrations = await prisma.integration.findMany({
        where,
        select: {
          id: true,
          type: true,
          url: true,
          login: true,
          password: true,
          apiKey: true,
          config: true,
          createdAt: true,
          updatedAt: true,
          companyGroup: {
            select: { id: true, name: true },
          },
          companies: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return reply.status(200).send(integrations);
    }
  );
};
