import { userSchema } from "@/auth/models/user";
import { FastifyRequest } from "fastify";
import { UnauthorizedException } from "../exceptions/unauthorized-exception";
import { companyGroupSchema } from "@/auth/models/company-group";

export function getAuthUser(request: FastifyRequest) {
  const payload = request.user
  const parsed = userSchema.safeParse(payload)

  if (!parsed.success) {
    throw new UnauthorizedException()
  }

  return parsed.data
}

export function getCaslCompanyGroup({ companyGroupId}: { companyGroupId: string }) {
  return companyGroupSchema.parse({
    __typename: 'CompanyGroup',
    id: companyGroupId,
  })
}