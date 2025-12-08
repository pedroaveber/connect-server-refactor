import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const getCompanyGroupPhones: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/company-groups/:companyGroupId/phones",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Get company group phones",
        operationId: "getCompanyGroupPhones",
        security: [{ BearerAuth: [] }],
        description: "Get company group phones",
        params: z.object({
          companyGroupId: z.string(),
        }),
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              phones: z.array(
                z.object({
                  id: z.string(),
                  number: z.string(),
                  name: z.string().nullable(),
                  isWhatsapp: z.boolean(),
                  createdAt: z.date(),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.companyGroup.read,
        target: {
          companyGroupId: request.params.companyGroupId,
        },
      });

      const { companyGroupId } = request.params;

      const companyGroup = await prisma.companyGroup.findUnique({
        select: {
          id: true,
          phones: {
            select: {
              id: true,
              number: true,
              name: true,
              isWhatsapp: true,
              createdAt: true,
            },
          },
        },
        where: {
          id: companyGroupId,
        },
      });

      if (!companyGroup) {
        throw new ResourceNotFoundException("Grupo empresarial não encontrado");
      }

      return reply.status(200).send({
        data: {
          ...companyGroup,
        },
      });
    }
  );
};
