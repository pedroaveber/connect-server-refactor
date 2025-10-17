import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { env } from "@/env";
import { r2 } from "@/lib/cloudfare";

import { auth } from "@/http/hooks/auth";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import z from "zod";

export async function getPressignedUrl(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .post(
      "/upload",
      {
        schema: {
          security: [{ BearerAuth: [] }],
          preHandler: [auth],
          tags: ["Upload"],
          summary: "Get pressigned url",
          operationId: "getPressignedUrl",
          description:
            "Get pressigned url to upload a file directly to the storage",
          body: z.discriminatedUnion("folder", [
            z.object({
              folder: z.literal("document"),
              fileSize: z.number().max(5 * 1024 * 1024), // 5MB
              fileName: z.string().regex(/\.(pdf)$/),
              fileType: z.string().regex(/(application\/pdf)/),
            }),
            z.object({
              folder: z.literal("image"),
              fileSize: z.number().max(10 * 1024 * 1024), // 5MB
              fileName: z.string().regex(/\.(png|jpeg|jpg)$/),
              fileType: z.string().regex(/image\/(png|jpeg|jpg)/),
            }),
            z.object({
              folder: z.literal("video"),
              fileSize: z.number().max(50 * 1024 * 1024), // 50MB
              fileName: z.string().regex(/\.(mp4|webm|ogg)$/),
              fileType: z.string().regex(/video\/(mp4|webm|ogg)/),
            }),
            z.object({
              folder: z.literal("audio"),
              fileSize: z.number().max(10 * 1024 * 1024), // 10MB
              fileName: z.string().regex(/\.(m4a|webm|mp3|wav)$/),
              fileType: z.string().regex(/audio\/(m4a|webm|mp3|wav)/), // Match valid audio MIME types
            }),
          ]),
          response: {
            201: z.object({
              pressignedUrl: z.string().url(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { fileName, fileType } = request.body;
        try {
          const pressignedUrl = await getSignedUrl(
            r2,
            new PutObjectCommand({
              Bucket: env.AWS_BUCKET_NAME,
              Key: fileName,
              ContentType: fileType,
            }),
            {
              expiresIn: 60 * 5, // 5 minutes
            }
          )

          return reply.status(201).send({
            pressignedUrl,
          });
        } catch (error) {
          throw new Error("Falha ao gerar url de upload");
        }
      }
    );
}