import { createBullBoard } from "@bull-board/api"
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"
import { FastifyAdapter } from "@bull-board/fastify"
import type { FastifyPluginCallback } from "fastify"
import { createBatchUsersQueue } from "./queues/create-batch-users-queue"

export const bullMqAdapter: FastifyPluginCallback = (app) => {
  const serverAdapter = new FastifyAdapter()
  const queues = [new BullMQAdapter(createBatchUsersQueue)]

  createBullBoard({
    queues,
    serverAdapter,
  })

  serverAdapter.setBasePath("/admin/queues")

  app.register(serverAdapter.registerPlugin(), {
    prefix: "/admin/queues",
  })
}
