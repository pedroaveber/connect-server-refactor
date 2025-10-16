import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const updateCompany: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/companies/:companyId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Update company",
        operationId: "updateCompany",
        security: [{ BearerAuth: [] }],
        description: "Update company",
        params: z.object({
          companyId: z.cuid(),
        }),
        body: z.object({
          name: z.string(),
          document: z.string().length(14).meta({
            description: "Brazilian CNPJ",
          }),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { companyId } = request.params;
      const { document, name } = request.body;

      const company = await prisma.company.findUnique({
        where: {
          id: companyId,
        },
      });

      if (!company) {
        throw new ResourceNotFoundException("Empresa não encontrada");
      }

      const hasChangedDocument = company.document !== document;

      if (hasChangedDocument) {
        const companyWithSameDocument = await prisma.company.findFirst({
          where: {
            document,
            NOT: {
              id: companyId,
            },
          },
        });

        if (companyWithSameDocument) {
          throw new ConflictException(
            "Já existe uma empresa com este documento"
          );
        }
      }

      await prisma.company.update({
        where: {
          id: companyId,
        },
        data: {
          name,
          document,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
