import { PubSub } from "./pub-sub"

type CreateBatchUsersMessage =
  | {
      kind: "failed"
      user: {
        name: string
        document: string
        birthDate: string
        errorMessage: string
      }
    }
  | {
      kind: "created"
      user: {
        id: string
        name: string
        document: string
        birthDate: string
      }
    }
  | {
      kind: "progress"
      progress: {
        total: number
        totalCreated: number
        totalFailed: number
        totalPending: number
        percentage: number
      }
    }
  | {
      kind: "completed"
    }

export const createBatchUsersPubSub = new PubSub<CreateBatchUsersMessage>()
