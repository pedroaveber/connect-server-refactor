import { Queue } from "bullmq"
import { redis } from "@/database/redis"

export const JOB_NAME = "CreateBatchUsersQueue"

export type CreateBatchUsersJobData = {
  users: {
    name: string
    document: string
    birthDate: string
    companyGroupId?: string
    companiesIds?: string[]
    unitsIds?: string[]
    basesIds?: string[]
    associatedCompanyGroupId: string
    roles: ("ADMIN" | "COMPANY_GROUP_ADMIN" | "MEMBER")[]
  }[]
}

export const createBatchUsersQueue = new Queue<CreateBatchUsersJobData>(
  JOB_NAME,
  {
    connection: redis,
    defaultJobOptions: {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: true,
    },
  }
)
