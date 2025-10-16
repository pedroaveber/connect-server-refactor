import { externalIntegrationsEnum } from "@/data/external-integration";
import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateIntegrationSchema = z.object({
  type: z.enum(externalIntegrationsEnum).optional(),
  isCompanyGroupWide: z.boolean().optional(),
  companyIds: z.array(z.string()).optional(),
  url: z.string().optional(),
  login: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

export const updateIntegration: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/integrations/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Integration"],
        summary: "Update integration",
        operationId: "updateIntegration",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string() }),
        body: updateIntegrationSchema,
        response: {
          200: z.object({ id: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const {
        type,
        isCompanyGroupWide,
        companyIds,
        url,
        login,
        password,
        apiKey,
        config,
      } = request.body;

      const integration = await prisma.integration.findUnique({
        where: { id },
        include: { companies: true },
      });

      if (!integration) {
        throw new ResourceNotFoundException("Integração não encontrada");
      }

      const companyGroupId = integration.companyGroupId;

      // Validação de unicidade
      if (isCompanyGroupWide ?? integration.isCompanyGroupWide) {
        // Se for group-wide, não pode haver outro do mesmo tipo para o grupo
        const existing = await prisma.integration.findFirst({
          where: {
            companyGroupId,
            type: type ?? integration.type,
            isCompanyGroupWide: true,
            NOT: { id },
          },
        });

        if (existing) {
          throw new ConflictException(
            "Já existe uma integração desse tipo configurada para todo o grupo"
          );
        }
      } else if (companyIds && companyIds.length > 0) {
        // Se for por empresa, não pode existir duplicidade do mesmo tipo para as mesmas empresas
        const existing = await prisma.integration.findFirst({
          where: {
            companyGroupId,
            type: type ?? integration.type,
            isCompanyGroupWide: false,
            NOT: { id },
            companies: { some: { id: { in: companyIds } } },
          },
        });

        if (existing) {
          throw new ConflictException(
            "Já existe uma integração desse tipo configurada para uma ou mais das empresas selecionadas"
          );
        }
      }

      // Atualiza integração
      const updated = await prisma.integration.update({
        where: { id },
        data: {
          type,
          isCompanyGroupWide,
          url,
          login,
          password,
          apiKey,
          config,
          ...(isCompanyGroupWide
            ? { companies: { set: [] } }
            : companyIds
            ? { companies: { set: companyIds.map((id) => ({ id })) } }
            : {}),
        },
        select: { id: true },
      });

      return reply.status(200).send(updated);
    }
  );
};
