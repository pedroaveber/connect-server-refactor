import { z } from "zod";
import { unitSchema } from "../models/unit";

export const unitSubject = z.tuple([
  z.union([
    z.literal('manage'), 
    z.literal('create'), 
    z.literal('delete'),
    z.literal('update'),
    z.literal('list'),
    z.literal('read'),
  ]),
  z.union([z.literal('Unit'), unitSchema]),
])

export type UnitSubject = z.infer<typeof unitSubject>