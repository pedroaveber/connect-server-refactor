import { z } from "zod"

export const companyGroupSchema = z.object({
  __typename: z.literal("CompanyGroup").default("CompanyGroup"),
  id: z.string(),
})

export type CompanyGroup = z.infer<typeof companyGroupSchema>
