import { z } from "zod"
import { companySchema } from "../models/company"

export const companySubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("create"),
    z.literal("delete"),
    z.literal("update"),
    z.literal("listUnits"),
    z.literal("read"),
  ]),
  z.union([z.literal("Company"), companySchema]),
])

export type CompanySubject = z.infer<typeof companySubject>
