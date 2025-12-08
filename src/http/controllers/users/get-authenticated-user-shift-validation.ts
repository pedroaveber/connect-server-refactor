import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@/database/prisma";
import { auth } from "@/http/hooks/auth";
import { UnauthorizedException } from "@/http/exceptions/unauthorized-exception";

export const getAuthenticatedUserShiftValidation: FastifyPluginCallbackZod = (
  app
) => {
  app.get(
    "/users/me/shift/validation",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Get authenticated user with shift validation",
        security: [{ BearerAuth: [] }],
        operationId: "getAuthenticatedUserShiftValidation",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              shift: z.object({
                isValid: z.boolean(),
                shiftStart: z.date().nullable(),
                shiftEnd: z.date().nullable(),
                refetchAt: z.date(),
              }),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.sub;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          ambulance: {
            select: {
              ambulanceShiftHistories: {
                select: {
                  shiftStart: true,
                  shiftEnd: true,
                },
                orderBy: { createdAt: "desc" },
                take: 1,
              },
            },
          },
        },
      });

      if (!user) {
        throw new UnauthorizedException("Usuário não encontrado");
      }

      const lastShift = user.ambulance?.ambulanceShiftHistories[0] ?? null;

      const now = new Date();

      const isValid =
        !!lastShift &&
        lastShift.shiftStart <= now &&
        (lastShift.shiftEnd === null || lastShift.shiftEnd >= now);

      return reply.status(200).send({
        data: {
          id: user.id,
          shift: {
            isValid,
            shiftStart: lastShift?.shiftStart ?? null,
            shiftEnd: lastShift?.shiftEnd ?? null,
            refetchAt: new Date(),
          },
        },
      });
    }
  );
};
