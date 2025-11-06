import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { env } from "@/env"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslAmbulance } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"
import { r2 } from "@/lib/cloudfare"

export const createAmbulanceDocument: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/ambulances/:id/documents",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Create an ambulance document",
        operationId: "createAmbulanceDocument",
        security: [{ BearerAuth: [] }],
        params: z.object({ id: z.cuid() }),
        body: z.object({
          name: z.string(),
          mimeType: z.string(),
          fileSize: z.number().max(5 * 1024 * 1024), // 5MB
          fileExtension: z.string(),
          expiresAt: z.string().pipe(z.coerce.date()),
        }),
        response: {
          201: z.object({
            pressignedUrl: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)

      const { id } = request.params
      const { fileExtension, fileSize, name, mimeType, expiresAt } =
        request.body

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
      })

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found")
      }

      const { can } = defineAbilityFor(authUser)

      const caslAmbulance = getCaslAmbulance({
        id: ambulance.id,
        baseId: ambulance.baseId,
        unitId: ambulance.unitId,
        companyId: ambulance.companyId,
        companyGroupId: ambulance.companyGroupId,
      })

      if (can("update", caslAmbulance) === false) {
        throw new ForbiddenException()
      }

      const customFileName = `ambulance-documents/${name}-${Date.now()}.${fileExtension}`

      const pressignedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({
          Bucket: env.AWS_BUCKET_NAME,
          Key: customFileName,
          ContentType: mimeType,
        }),
        {
          expiresIn: 60 * 5, // 5 minutes
        }
      )

      const downloadUrl = `${env.AWS_PUBLIC_SUBDOMAIN}/${customFileName}`

      await prisma.ambulanceDocuments.create({
        data: {
          downloadUrl,
          fileExtension,
          fileSize,
          name,
          expiresAt,
          ambulanceId: id,
        },
      })

      return reply.status(201).send({
        pressignedUrl,
      })
    }
  )
}
