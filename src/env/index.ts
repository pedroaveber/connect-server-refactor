import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number(),
  ENV: z.enum(["development", "staging", "production"]),
  DATABASE_URL: z.string().url(),
  CRYPTO_SECRET_KEY: z.string(),
  JWT_PRIVATE_KEY: z.string(),
  JWT_PUBLIC_KEY: z.string(),
  AWS_ACCESS_KEY_ID: z.string(),
  AWS_BUCKET_NAME: z.string(),
  AWS_SECRET_ACCESS_KEY: z.string(),
  AWS_SESSION_TOKEN: z.string(),
  AWS_JURISDICTION: z.string(),
  AWS_ACCOUNT_ID: z.string(),
  AWS_PUBLIC_SUBDOMAIN: z.string().url(),
  ABLY_PRIVATE_KEY: z.string(),
  CLOUDFARE_REALTIME_API_URL: z.string(),
  CLOUDFARE_ORGANIZATION_ID: z.string(),
  CLOUDFARE_API_KEY: z.string(),
});

export const env = envSchema.parse(process.env);
