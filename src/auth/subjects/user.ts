import { z } from "zod"
import { userSchema } from "../models/user"

export const userSubject = z.tuple([
  z.enum(['create', 'delete', 'invite', 'manage']),
  z.union([z.literal('User'), userSchema]),
])

export type UserSubject = z.infer<typeof userSubject>