import { z } from "zod"
import { ambulanceSchema } from "../models/ambulance"

export const ambulanceSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("create"),
    z.literal("delete"),
    z.literal("update"),
    z.literal("switchStatus"),
    z.literal("switchBase"),
    z.literal("list"),
    z.literal("read"),
  ]),
  z.union([z.literal("Ambulance"), ambulanceSchema]),
])

export type AmbulanceSubject = z.infer<typeof ambulanceSubject>
