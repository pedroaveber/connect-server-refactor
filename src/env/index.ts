import { z } from "zod"

const PORT = 3333

const envSchema = z.object({
  PORT: z.coerce.number().default(PORT),
  NODE_ENV: z.enum(["development", "staging", "production"]),
  CRYPTO_SECRET_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
