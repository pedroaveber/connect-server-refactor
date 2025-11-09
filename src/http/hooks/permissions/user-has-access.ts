// src/auth/user-has-access.ts

import type { FastifyJWTPayload } from "@/@types/fastify-jwt";
import { permissions, type Permission } from "@/data/permissions";
import { ForbiddenException } from "@/http/exceptions/forbidden-exception";
import { UnauthorizedException } from "@/http/exceptions/unauthorized-exception";
import { TargetScope } from "./authorize-plugin";

type UserHasAccessArgs = {
  user: FastifyJWTPayload;
  permission?: Permission | Permission[]; // ✅ uma ou várias permissões
  target?: TargetScope;
  requireAll?: boolean; // opcional — se true, exige TODAS as permissões
};

export function userHasAccess({
  user,
  permission,
  target,
  requireAll = true,
}: UserHasAccessArgs) {
  if (!user) throw new UnauthorizedException("Usuário não autenticado");

  // --- Permissão total do sys_admin ---
  if (user.roles.includes(permissions.sys_admin.accessAll)) return true;

  // --- Permissões (roles) ---
  if (permission) {
    const required = Array.isArray(permission) ? permission : [permission];
    const hasAll = required.every((p) => user.roles.includes(p));
    const hasSome = required.some((p) => user.roles.includes(p));

    if (requireAll ? !hasAll : !hasSome) {
      const perms = required.join(", ");
      throw new ForbiddenException(`Usuário sem permissão: ${perms}`);
    }
  }

  // --- Escopo hierárquico opcional (OR lógico) ---
  if (target) {
    const checks: boolean[] = [];

    if (target.companyGroupId)
      checks.push(user.companyGroupId === target.companyGroupId);

    if (target.companyId)
      checks.push(user.companiesIds?.includes(target.companyId) ?? false);

    if (target.unitId)
      checks.push(user.unitsIds?.includes(target.unitId) ?? false);

    if (target.baseId)
      checks.push(user.basesIds?.includes(target.baseId) ?? false);

    // Se há pelo menos um target definido e nenhum passou → negar acesso
    if (checks.length > 0 && !checks.some(Boolean)) {
      throw new ForbiddenException(
        "Usuário não possui acesso a nenhum dos escopos informados"
      );
    }
  }

  return true;
}
