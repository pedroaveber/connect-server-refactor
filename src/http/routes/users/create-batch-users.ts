import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod"
import { z } from "zod"
import { defineAbilityFor } from "@/auth"
import { BadRequestException } from "@/http/exceptions/bad-request-exception"
import { ForbiddenException } from "@/http/exceptions/forbidden-exception"
import { getAuthUser, getCaslUser } from "@/http/helpers/casl"
import { auth } from "@/http/hooks/auth"
import {
  createBatchUsersQueue,
  JOB_NAME,
} from "@/jobs/queues/create-batch-users-queue"
import { zodRolesEnum } from "@/utils/zod"

export const createBatchUsers: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/users/batch",
    {
      preHandler: [auth],
      schema: {
        tags: ["User"],
        summary: "Create batch users",
        operationId: "createBatchUsers",
        body: z.object({
          users: z.array(
            z.object({
              name: z.string(),
              document: z.string(),
              birthDate: z.string(),
              roles: z.array(zodRolesEnum),
              companyGroupId: z.cuid().optional(),
              companiesIds: z.array(z.cuid()).optional().default([]),
              unitsIds: z.array(z.cuid()).optional().default([]),
              basesIds: z.array(z.cuid()).optional().default([]),
            })
          ),
        }),
        response: { 202: z.object({ id: z.string() }) },
      },
    },
    async (request, reply) => {
      const authUser = getAuthUser(request)
      const { can } = defineAbilityFor(authUser)

      const { users } = request.body

      const caslUser = getCaslUser({
        associatedCompanyGroupId: authUser.associatedCompanyGroupId,
        roles: ["MEMBER"],
        userId: "FAKE_CUID",
      })

      if (can("create", caslUser) === false) {
        throw new ForbiddenException()
      }

      const job = await createBatchUsersQueue.add(JOB_NAME, {
        users: users.map((user) => ({
          ...user,
          // biome-ignore lint/style/noNonNullAssertion: <Will be provided by the user>
          associatedCompanyGroupId: authUser.associatedCompanyGroupId!,
        })),
      })

      if (!job.id) {
        throw new BadRequestException("Failed to create batch users")
      }

      return reply.status(202).send({ id: job.id })
    }
  )
}
