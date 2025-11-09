import fp from "fastify-plugin";
import { userHasAccess } from "@/http/hooks/permissions/user-has-access";
import type { Permission } from "@/data/permissions";

export type TargetScope = {
  companyGroupId?: string;
  companyId?: string;
  unitId?: string;
  baseId?: string;
};

export default fp(async (app) => {
  /**
   * Decorator para `request.authorize`
   * - Já injeta o `request.user` automaticamente
   * - Mantém tipagem forte
   */
  app.decorateRequest(
    "authorize",
    function ({
      permission,
      target,
      requireAll = true,
    }: {
      permission?: Permission | Permission[];
      target?: TargetScope;
      requireAll?: boolean;
    }) {
      return userHasAccess({
        user: this.user,
        permission,
        target,
        requireAll,
      });
    }
  );
});
