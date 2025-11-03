import type { Role } from "@/auth/roles"
import "@fastify/jwt"

declare module "@fastify/jwt" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: <Not necessary to be consistent>
  interface FastifyJWT {
    payload: {
      sub: string
      companyGroupId?: string
      companiesIds?: string[]
      unitsIds?: string[]
      basesIds?: string[]
      roles: Role[]
    }
  }
}
