import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteIntegration: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/integrations/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Integration"],
        summary: "Delete integration",
        operationId: "deleteIntegration",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.string() }),
        response: {
          204: z.object({
            id: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const integration = await prisma.integration.findUnique({
        where: { id },
      });
      if (!integration) {
        throw new ResourceNotFoundException("Integração não encontrada");
      }

      await prisma.integration.delete({ where: { id } });

      return reply.status(204).send({ id });
    }
  );
};
