import { z } from "zod"

export const zodAmbulanceStatusEnum = z.enum([
  "QAP",
  "OCP",
  "EVT",
  "J4",
  "J5",
  "FA",
  "MN",
])

export const zodRolesEnum = z.enum(["ADMIN", "COMPANY_GROUP_ADMIN", "MEMBER"])
