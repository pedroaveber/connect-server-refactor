import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteBasePhoneNumber: FastifyPluginCallbackZod = (app) => {
  app.delete(
    "/bases/:baseId/phones/:phoneId",
    {
      preHandler: [auth],
      schema: {
        tags: ["Base"],
        summary: "Delete base phone number",
        operationId: "deleteBasePhoneNumber",
        security: [{ BearerAuth: [] }],
        description: "Delete a phone number from a base",
        params: z.object({
          baseId: z.cuid(),
          phoneId: z.cuid(),
        }),
        response: {
          204: z.null(),
        },
      },
    },
    async (request, reply) => {
      const { baseId, phoneId } = request.params;

      const phone = await prisma.phone.findFirst({
        where: {
          id: phoneId,
          baseId,
        },
      });

      if (!phone) {
        throw new ResourceNotFoundException("Número de telefone não encontrado");
      }

      await prisma.phone.delete({
        where: {
          id: phoneId,
        },
      });

      return reply.status(204).send(null);
    }
  );
};
