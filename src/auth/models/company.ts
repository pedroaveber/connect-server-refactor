import { z } from "zod";

export const companySchema = z.object({
  __typename: z.literal('Company').default('Company'),
  id: z.string(),
  companyGroupId: z.string(),
})

export type Company = z.infer<typeof companySchema>