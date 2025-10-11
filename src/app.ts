import { fastifyCookie } from "@fastify/cookie"
import { fastifyCors } from "@fastify/cors"
import { fastifyJwt } from "@fastify/jwt"
import { fastifySwagger } from "@fastify/swagger"
import scalarApiReference from "@scalar/fastify-api-reference"
import { fastify } from "fastify"
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod"
import { env } from "./env"
import { checkAuth } from "./http/routes/auth/check-auth"
import { signIn } from "./http/routes/auth/sign-in"
import { signOut } from "./http/routes/auth/sign-out"
import { createCompanyGroup } from "./http/routes/company-group/create-company-group"
import { healthCheck } from "./http/routes/health-check"

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

// Http Routes
app.register(healthCheck)

app.register(signIn)
app.register(signOut)
app.register(checkAuth)
app.register(createCompanyGroup)
