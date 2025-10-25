import { z } from "zod";

export const baseSchema = z.object({
  __typename: z.literal('Base').default('Base'),
  id: z.string(),
  unitId: z.string(),
  unitGroupId: z.string(),
  companyId: z.string(),
  companyGroupId: z.string(),
})

export type Base = z.infer<typeof baseSchema>