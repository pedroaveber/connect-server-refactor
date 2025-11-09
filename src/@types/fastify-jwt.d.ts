import type { Permission } from "@/data/permissions";
import type { TargetScope } from "@/http/hooks/permissions/authorize-plugin";
import "@fastify/jwt";

export interface FastifyJWTPayload {
  sub: string;
  companyGroupId?: string;
  companiesIds?: string[];
  unitsIds?: string[];
  basesIds?: string[];
  roles: Permission[];
}

declare module "@fastify/jwt" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: <Not necessary to be consistent>
  interface FastifyJWT {
    payload: FastifyJWTPayload; // 👈 aqui estava {}, precisa ser esse tipo
    user: FastifyJWTPayload; // 👈 opcional, útil pra request.user
  }
}

declare module "fastify" {
  interface FastifyRequest {
    authorize: (args: {
      permission?: Permission | Permission[];
      target?: TargetScope;
      requireAll?: boolean;
    }) => boolean;
  }
}
