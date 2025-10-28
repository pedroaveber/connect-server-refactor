import type { FastifyRequest } from "fastify"
import { companySchema } from "@/auth/models/company"
import { companyGroupSchema } from "@/auth/models/company-group"
import { userSchema } from "@/auth/models/user"
import { UnauthorizedException } from "../exceptions/unauthorized-exception"

export function getAuthUser(request: FastifyRequest) {
  const payload = request.user
  const parsed = userSchema.safeParse(payload)

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
