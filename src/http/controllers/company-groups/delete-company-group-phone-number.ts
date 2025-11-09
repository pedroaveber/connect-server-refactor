import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { permissions } from "@/data/permissions";

export const deleteCompanyGroupPhoneNumber: FastifyPluginCallbackZod = (
  app
) => {
  app.delete(
    "/company-groups/:companyGroupId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Company Group"],
        summary: "Delete company group phone number",
        operationId: "deleteCompanyGroupPhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete company group phone number",
        params: z.object({
          companyGroupId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      request.authorize({
        permission: permissions.companyGroup.deletePhoneNumber,
        target: {
          companyGroupId: request.params.companyGroupId,
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
