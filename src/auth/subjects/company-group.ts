import { z } from "zod";
import { companyGroupSchema } from "../models/company-group";

export const companyGroupSubject = z.tuple([
  z.union([
    z.literal('manage'), 
    z.literal('create'), 
    z.literal('delete'),
    z.literal('update'),
    z.literal('list'),
    z.literal('read'),
  ]),
  z.union([z.literal('CompanyGroup'), companyGroupSchema]),
])

export type CompanyGroupSubject = z.infer<typeof companyGroupSubject>