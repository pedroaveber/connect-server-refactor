import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { prisma } from "@/database/prisma"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { ResourceNotFoundException } from "@/http/exceptions/resource-not-found-exception"
import { getAuthUser, getCaslAmbulance } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"
import { zodAmbulanceStatusEnum } from "@/utils/zod"

export const getAmbulance: FastifyPluginCallbackZod = (app) => {
  app.get(
    "/ambulances/:id",
    {
      preHandler: [auth],
      schema: {
        tags: ["Ambulance"],
        summary: "Get ambulance by ID",
        params: z.object({ id: z.cuid() }),
        operationId: "getAmbulance",
        response: {
          200: z.object({
            data: z.object({
              id: z.string(),
              name: z.string(),
              status: zodAmbulanceStatusEnum,
              observations: z.string().nullable(),
              licensePlate: z.string(),
              base: z.object({
                id: z.string(),
                name: z.string(),
                document: z.string().nullable(),
                unit: z.object({
                  id: z.string(),
                  name: z.string(),
                  company: z.object({
                    id: z.string(),
                    name: z.string(),
                    document: z.string(),
                    companyGroup: z.object({
                      id: z.string(),
                      name: z.string(),
                      document: z.string(),
                    }),
                  }),
                }),
              }),
              documents: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  downloadUrl: z.string(),
                  fileExtension: z.string(),
                  fileSize: z.number(),
                  createdAt: z.date(),
                  expiresAt: z.date(),
                })
              ),
              statusHistory: z.array(
                z.object({
                  id: z.cuid(),
                  fromStatus: zodAmbulanceStatusEnum,
                  toStatus: zodAmbulanceStatusEnum,
                  createdAt: z.date(),
                  user: z.object({
                    id: z.cuid(),
                    name: z.string(),
                  }),
                })
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params

      const authUser = getAuthUser(request)
      const { can } = defineAbilityFor(authUser)

      const ambulance = await prisma.ambulance.findUnique({
        where: { id, deletedAt: null },
        include: {
          documents: {
            where: { deletedAt: null },
          },
          base: {
            select: {
              id: true,
              name: true,
              document: true,
              unit: {
                select: {
                  id: true,
                  name: true,
                  company: {
                    select: {
                      id: true,
                      name: true,
                      document: true,
                      companyGroup: {
                        select: {
                          id: true,
                          name: true,
                          document: true,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          statusHistory: {
            select: {
              id: true,
              fromStatus: true,
              toStatus: true,
              createdAt: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
            take: 10,
          },
        },
      })

      if (!ambulance) {
        throw new ResourceNotFoundException("Ambulance not found")
      }

      const caslAmbulance = getCaslAmbulance({
        id: ambulance.id,
        companyId: ambulance.companyId,
        baseId: ambulance.baseId,
        unitId: ambulance.unitId,
        companyGroupId: ambulance.companyGroupId,
      })

      if (can("read", caslAmbulance) === false) {
        throw new ForbiddenException()
      }

      return reply.status(200).send({
        data: ambulance,
      })
    }
  )
}
