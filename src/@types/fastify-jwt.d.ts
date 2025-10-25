import { Role } from "@/auth/roles"
import "@fastify/jwt"

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: {
      sub: string
      companyGroupId?: string
      companyId?: string
      unitId?: string
      baseId?: string
      role: Role
    }
  }
}
