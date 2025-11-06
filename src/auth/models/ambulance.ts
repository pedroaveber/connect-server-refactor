import { z } from "zod"

export const ambulanceSchema = z.object({
  __typename: z.literal("Ambulance").default("Ambulance"),
  id: z.string(),
  unitId: z.string(),
  baseId: z.string(),
  companyId: z.string(),
  companyGroupId: z.string(),
})

export type Ambulance = z.infer<typeof ambulanceSchema>
