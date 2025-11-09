import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteCompanyPhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/companies/:companyId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company"],
        summary: "Delete company phone number",
        operationId: "deleteCompanyPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete company phone number",
        params: z.object({
          companyId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.company.deletePhoneNumber,
        target: {
          companyId: request.params.companyId,
        },
      });

      const { phoneId } = request.params;

      await prisma.phone.delete({
        where: {
          id: phoneId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
