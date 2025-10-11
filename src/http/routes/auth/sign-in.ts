import { verify } from "argon2"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { prisma } from "@/database/prisma"
import { env } from "@/env"
import { BadRequestException } from "@/http/exceptions/bad-request-exception"

export const signIn: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/auth/sign-in",
    {
      schema: {
        tags: ["Auth"],
        summary: "Sign in",
        description:
          "Sign in to the application informing the document and password",
        body: z.object({
          document: z.string().length(11).meta({
            title: "Brazilian CPF",
            description: "The document of the user (Example: 12332145698)",
          }),
          password: z.string(),
        }),
        response: {
          201: z.object({
            accessToken: z.jwt(),
            refreshToken: z.jwt(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { document, password } = request.body

      const userWithDocument = await prisma.user.findUnique({
        where: {
          document,
        },
      })

      if (userWithDocument === null) {
        throw new BadRequestException("Credenciais inválidas")
      }

      const isPasswordValid = await verify(userWithDocument.password, password)

      if (isPasswordValid === false) {
        throw new BadRequestException("Credenciais inválidas")
      }

      const accessToken = app.jwt.sign(
        {
          sub: userWithDocument.id,
        },
        {
          expiresIn: "30m",
        }
      )

      const refreshToken = app.jwt.sign(
        {
          sub: userWithDocument.id,
        },
        {
          expiresIn: "7d",
        }
      )

      reply.setCookie("accessToken", accessToken, {
        path: "/",
        httpOnly: true,
        secure: env.ENV === "production",
        sameSite: env.ENV === "production" ? "none" : "lax",
        maxAge: 30 * 60 * 1000, // 30 minutes
      })

      reply.setCookie("refreshToken", refreshToken, {
        path: "/",
        httpOnly: true,
        secure: env.ENV === "production",
        sameSite: env.ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })

      return reply.status(201).send({
        accessToken,
        refreshToken,
      })
    }
  )
}
