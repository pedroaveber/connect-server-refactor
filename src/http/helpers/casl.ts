import type { FastifyRequest } from "fastify"
import { baseSchema } from "@/auth/models/base"
import { companySchema } from "@/auth/models/company"
import { companyGroupSchema } from "@/auth/models/company-group"
import { unitSchema } from "@/auth/models/unit"
import { userSchema } from "@/auth/models/user"
import { UnauthorizedException } from "../exceptions/unauthorized-exception"

export function getAuthUser(request: FastifyRequest) {
  const payload = request.user

  const parsed = userSchema.safeParse({
    ...payload,
    id: payload.sub,
  })

  if (!parsed.success) {
    throw new UnauthorizedException()
  }

  return parsed.data
}

export function getCaslCompanyGroup({
  companyGroupId,
}: {
  companyGroupId: string
}) {
  return companyGroupSchema.parse({
    __typename: "CompanyGroup",
    id: companyGroupId,
  })
}

export function getCaslCompany({
  companyId,
  companyGroupId,
}: {
  companyId: string
  companyGroupId: string
}) {
  return companySchema.parse({
    __typename: "Company",
    id: companyId,
    companyGroupId,
  })
}

export function getCaslUnit({
  unitId,
  companyId,
  companyGroupId,
}: {
  unitId: string
  companyId: string
  companyGroupId: string
}) {
  return unitSchema.parse({
    __typename: "Unit",
    id: unitId,
    companyId,
    companyGroupId,
  })
}

export function getCaslBase({
  baseId,
  unitId,
  companyId,
  companyGroupId,
}: {
  baseId: string
  unitId: string
  companyId: string
  companyGroupId: string
}) {
  return baseSchema.parse({
    __typename: "Base",
    id: baseId,
    unitId,
    companyId,
    companyGroupId,
  })
}
