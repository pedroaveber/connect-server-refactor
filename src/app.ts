import { fastifyCookie } from "@fastify/cookie"
import { fastifyCors } from "@fastify/cors"
import { fastifyJwt } from "@fastify/jwt"
import { fastifySwagger } from "@fastify/swagger"
import scalarApiReference from "@scalar/fastify-api-reference"
import fs from 'node:fs'
import { fastify } from "fastify"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"
import { env } from "./env"
import Routing from "./http/routing"

export const app = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>()

app.setSerializerCompiler(serializerCompiler)
app.setValidatorCompiler(validatorCompiler)

// Decrypt incoming JSON bodies when payload is encrypted
// app.addHook("preValidation", decrypt)

// Encrypt outgoing JSON bodies when payload is encrypted
// app.addHook("onSend", encrypt) 

app.register(fastifyCors, {
  origin: ["http://localhost:5173"],
  credentials: true,
})

app.register(fastifyCookie)

app.register(fastifyJwt, {
  sign: {
    algorithm: "RS256",
  },
  secret: {
    public: Buffer.from(env.JWT_PUBLIC_KEY, "base64"),
    private: Buffer.from(env.JWT_PRIVATE_KEY, "base64"),
  },
})

app.register(fastifySwagger, {
  openapi: {
    info: {
      title: "Connect | Server",
      version: "2.0.0",
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },

  transform: jsonSchemaTransform,
})

if (env.ENV === "development") {
  app.register(scalarApiReference, {
    routePrefix: "/docs",
    configuration: {
      theme: "elysiajs",
    },
  })
}

Routing()

app.ready(async ()  => {
  const json = app.swagger()
  fs.writeFileSync('swagger.json', JSON.stringify(json, null, 2))
})
