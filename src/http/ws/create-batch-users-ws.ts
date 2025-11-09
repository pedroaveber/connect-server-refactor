import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { createBatchUsersPubSub } from "../events/create-batch-users-pub-sub"

export const createBatchUsersWs: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ws/users/batch/:jobId",
    {
      websocket: true,
      schema: {
        tags: ["WebSocket"],
        summary: "Create batch users WebSocket",
        operationId: "createBatchUsersWs",
        params: z.object({
          jobId: z.string(),
        }),
      },
    },
    // biome-ignore lint/suspicious/useAwait: <Function must be async>
    async (connection, request) => {
      const { jobId } = request.params

      createBatchUsersPubSub.subscribe(jobId, (message) => {
        connection.send(JSON.stringify(message))
      })
    }
  )
}
