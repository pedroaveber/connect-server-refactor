import { moduleBillingTypeEnum } from "@/data/module-billing-type";
import { moduleNamesEnum } from "@/data/modules-names";
import { prisma } from "@/database/prisma";
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception";
import { auth } from "@/http/hooks/auth";
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";

const updateModuleSchema = z.object({
  name: z.enum(moduleNamesEnum).optional(),
  description: z.string().optional(),
  billingType: z.enum(moduleBillingTypeEnum).optional(),
  defaultPrice: z.number().optional(),
  internal: z.boolean().optional(),
});

export const updateModule: FastifyPluginCallbackZod = (app) => {
  app.put(
    "/modules/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Module"],
        summary: "Update a module",
        operationId: "updateModule",
        params: z.object({ id: z.cuid() }),
        body: updateModuleSchema,
        response: { 200: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const data = request.body;

      const module = await prisma.module.findUnique({ where: { id } });
      if (!module) throw new ResourceNotFoundException("Module not found");

      const updatedModule = await prisma.module.update({ where: { id }, data });
      return reply.status(200).send({ id: updatedModule.id });
    }
  );
};
