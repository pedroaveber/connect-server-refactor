import { z } from "zod"

export const roleSchema = z.enum(["ADMIN", "COMPANY_GROUP_ADMIN", "MEMBER"])

export type Role = z.infer<typeof roleSchema>
