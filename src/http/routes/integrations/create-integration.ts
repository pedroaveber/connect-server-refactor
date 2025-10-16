import { externalIntegrationsEnum } from "@/data/external-integration";
import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createIntegrationSchema = z.object({
  type: z.enum(externalIntegrationsEnum),
  companyGroupId: z.string(),
  isCompanyGroupWide: z.boolean().default(false),
  companyIds: z.array(z.string()).optional(),
  url: z.string().optional(),
  login: z.string().optional(),
  password: z.string().optional(),
  apiKey: z.string().optional(),
  config: z.record(z.string(), z.any()).optional(),
});

export const createIntegration: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/integrations",
    {
      preHandler: [auth],
      schema: {
        tags: ["Integration"],
        summary: "Create integration",
        operationId: "createIntegration",
        security: [{ BearerAuth: [] }],
        body: createIntegrationSchema,
        response: {
          201: z.object({
            id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const {
        type,
        companyGroupId,
        isCompanyGroupWide,
        companyIds,
        url,
        login,
        password,
        apiKey,
        config,
      } = request.body;

      // Verifica se o grupo existe
      const companyGroup = await prisma.companyGroup.findUnique({
        where: { id: companyGroupId },
      });
      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo de empresas não encontrado");
      }

      // Validação de unicidade
      if (isCompanyGroupWide) {
        // Se for group-wide, só pode existir um do mesmo tipo para o grupo
        const existing = await prisma.integration.findFirst({
          where: {
            companyGroupId,
            type,
            isCompanyGroupWide: true,
          },
        });

        if (existing) {
          throw new ConflictException(
            "Já existe uma integração desse tipo configurada para todo o grupo"
          );
        }
      } else {
        // Se for por empresa, não pode haver integração duplicada do mesmo tipo para a mesma empresa
        if (companyIds && companyIds.length > 0) {
          const existing = await prisma.integration.findFirst({
            where: {
              companyGroupId,
              type,
              isCompanyGroupWide: false,
              companies: {
                some: {
                  id: { in: companyIds },
                },
              },
            },
          });

          if (existing) {
            throw new ConflictException(
              "Já existe uma integração desse tipo configurada para uma ou mais das empresas selecionadas"
            );
          }
        }
      }

      // Cria integração
      const integration = await prisma.integration.create({
        data: {
          type,
          companyGroupId,
          isCompanyGroupWide,
          url,
          login,
          password,
          apiKey,
          config,
          ...(isCompanyGroupWide
            ? {}
            : {
                companies: {
                  connect: companyIds?.map((id) => ({ id })) || [],
                },
              }),
        },
        select: {
          id: true,
        },
      });

      return reply.status(201).send({ id: integration.id });
    }
  );
};
