import { hash } from "argon2"
import { type Job, Worker } from "bullmq"
import dayjs from "dayjs"
import { prisma } from "@/database/prisma"
import { redis } from "@/database/redis"
import { createBatchUsersPubSub } from "@/http/events/create-batch-users-pub-sub"
import { handlePrismaError } from "@/http/exceptions/handler/prisma-error-handler"
import {
  type CreateBatchUsersJobData,
  JOB_NAME,
} from "../queues/create-batch-users-queue"

export const createBatchUsersWorker = new Worker<CreateBatchUsersJobData>(
  JOB_NAME,
  async (job: Job<CreateBatchUsersJobData>) => {
    if (!job.id) {
      throw new Error("Job ID is required")
    }

    const totalUsers = job.data.users.length

    let totalCreated = 0
    let totalFailed = 0

    function publishProgress() {
      if (!job.id) {
        return
      }

      createBatchUsersPubSub.publish(job.id, {
        kind: "progress",
        progress: {
          total: totalUsers,
          totalCreated,
          totalFailed,
          totalPending: totalUsers - totalCreated - totalFailed,
          percentage: (totalCreated / totalUsers) * 100,
        },
      })
    }

    for await (const user of job.data.users) {
      await new Promise((resolve) => setTimeout(resolve, 100))

      const userWithSameDocument = await prisma.user.findUnique({
        where: {
          document: user.document,
        },
      })

      if (userWithSameDocument) {
        createBatchUsersPubSub.publish(job.id, {
          kind: "failed",
          user: {
            birthDate: user.birthDate,
            name: user.name,
            document: user.document,
            errorMessage: "Usuário com este documento já existe",
          },
        })

        totalFailed++

        publishProgress()

        continue
      }

      try {
        const [day, month, year] = user.birthDate.split("/").map(Number)
        const birthDate = dayjs()
          .set("day", day)
          .set("month", month)
          .set("year", year)
          .toDate()

        const created = await prisma.user.create({
          data: {
            name: user.name,
            document: user.document,
            password: await hash(dayjs(birthDate).format("DDMMYYYY")),
            birthDate,
            associatedCompanyGroupId: user.associatedCompanyGroupId,
            roles: user.roles,
            organizations: {
              createMany: {
                data: [
                  {
                    ...(user.companyGroupId
                      ? { companyGroupId: user.companyGroupId }
                      : {}),
                    ...(user.companiesIds
                      ? user.companiesIds.map((companyId) => ({ companyId }))
                      : {}),
                    ...(user.unitsIds
                      ? user.unitsIds.map((unitId) => ({ unitId }))
                      : {}),
                    ...(user.basesIds
                      ? user.basesIds.map((baseId) => ({ baseId }))
                      : {}),
                  },
                ],
              },
            },
          },
        })

        createBatchUsersPubSub.publish(job.id, {
          kind: "created",
          user: {
            id: created.id,
            name: created.name,
            document: created.document,
            birthDate: dayjs(created.birthDate).format("DD/MM/YYYY"),
          },
        })

        totalCreated++

        publishProgress()
      } catch (error) {
        createBatchUsersPubSub.publish(job.id, {
          kind: "failed",
          user: {
            birthDate: user.birthDate,
            name: user.name,
            document: user.document,
            errorMessage: handlePrismaError(error),
          },
        })

        totalFailed++

        publishProgress()
      }
    }

    createBatchUsersPubSub.publish(job.id, {
      kind: "completed",
    })
  },
  {
    connection: redis,
  }
)
