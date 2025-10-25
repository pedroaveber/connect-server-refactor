import { roleSchema } from "../roles";
import { z } from "zod";

export const userSchema = z.object({
  __typename: z.literal('User').optional().default('User'),
  role: roleSchema,
  companyGroupId: z.string().optional(),
  companyId: z.string().optional(),
  unitId: z.string().optional(),
  baseId: z.string().optional(),
})

export type User = z.infer<typeof userSchema>