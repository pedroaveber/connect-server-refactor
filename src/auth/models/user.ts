import { z } from "zod"
import { roleSchema } from "../roles"

export const userSchema = z.object({
  __typename: z.literal("User").optional().default("User"),
  roles: z.array(roleSchema),
  id: z.string(),
  companyGroupId: z.string().optional(),
  companiesIds: z.array(z.string()).optional().default([]),
  unitsIds: z.array(z.string()).optional().default([]),
  basesIds: z.array(z.string()).optional().default([]),
  associatedCompanyGroupId: z.string().optional(),
})

export type User = z.infer<typeof userSchema>
