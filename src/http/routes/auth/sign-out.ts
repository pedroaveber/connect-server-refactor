import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { env } from "@/env"

export const signOut: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/auth/sign-out",
    {
      schema: {
        tags: ["Auth"],
        summary: "Sign out",
        description: "Sign out of the application",
        response: {
          204: z.null(),
        },
      },
    },
    // biome-ignore lint/suspicious/useAwait: <This kind of function must be async>
    async (_request, reply) => {
      reply.clearCookie("accessToken", {
        httpOnly: true,
        secure: env.ENV === "production",
        sameSite: env.ENV === "production" ? "none" : "lax",
      })

      reply.clearCookie("refreshToken", {
        httpOnly: true,
        secure: env.ENV === "production",
        sameSite: env.ENV === "production" ? "none" : "lax",
      })

      return reply.status(204).send(null)
    }
  )
}
