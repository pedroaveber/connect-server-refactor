import { moduleBillingTypeEnum } from "@/data/module-billing-type";
import { moduleNamesEnum } from "@/data/modules-names";
import { prisma } from "@/database/prisma";
import { ConflictException } from "@/http/exceptions/conflict-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const createModuleSchema = z.object({
  name: z.enum(moduleNamesEnum),
  description: z.string().optional(),
  billingType: z.enum(moduleBillingTypeEnum),
  defaultPrice: z.number().default(0),
  internal: z.boolean().optional(),
});

export const createModule: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/modules",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Create a new module",
        operationId: "createModule",
        body: createModuleSchema,
        response: { 201: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { name, description, billingType, defaultPrice, internal } = request.body;

      const existing = await prisma.module.findUnique({ where: { name } });
      if (existing) throw new ConflictException("Module name already exists");

      const module = await prisma.module.create({
        data: { name, description, billingType, defaultPrice, internal },
      });

      return reply.status(201).send({ id: module.id });
    }
  );
};
