import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"

export const healthCheck: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/health",
    {
      schema: {
        tags: ["Health Check"],
        summary: "Health Check",
        operationId: "healthCheck",
        description: "Health Check to the application",
        response: {
          200: z.object({
            status: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      await reply.status(200).send({
        status: "ok",
      })
    }
  )
}
