import { z } from "zod"
import { baseSchema } from "../models/base"

export const baseSubject = z.tuple([
  z.union([
    z.literal("manage"),
    z.literal("create"),
    z.literal("delete"),
    z.literal("update"),
    z.literal("list"),
    z.literal("listAmbulances"),
    z.literal("read"),
  ]),
  z.union([z.literal("Base"), baseSchema]),
])

export type BaseSubject = z.infer<typeof baseSubject>
