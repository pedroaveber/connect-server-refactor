import { z } from "zod";

export const roleSchema = z.enum([
  'SYS_ADMIN', 
  'COMPANY_GROUP_ADMIN',
  'COMPANY_ADMIN',
  'UNIT_ADMIN',
  'BASE_ADMIN',
])

export type Role = z.infer<typeof roleSchema>