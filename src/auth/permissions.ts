import type { AbilityBuilder } from "@casl/ability"
import type { AppAbility } from "."
import type { User } from "./models/user"
import type { Role } from "./roles"

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  SYS_ADMIN(_, { can }) {
    can("manage", "all")
  },

  COMPANY_GROUP_ADMIN(user, { can }) {
    can("manage", "User", {
      companyGroupId: {
        $eq: user.companyGroupId,
      },
    })

    can("list", "Company")
    can("manage", "Company", { companyGroupId: { $eq: user.companyGroupId } })

    can("manage", "Unit", { companyGroupId: { $eq: user.companyGroupId } })

    can("manage", "Base", { companyGroupId: { $eq: user.companyGroupId } })

    can(["update", "read"], "CompanyGroup", {
      id: { $eq: user.companyGroupId },
    })
  },

  COMPANY_ADMIN(user, { can }) {
    can("manage", "User", { companyId: { $eq: user.companyId } })
    can("manage", "Company", { id: { $eq: user.companyId } })
    can("manage", "Unit", { companyId: { $eq: user.companyId } })
    can("manage", "Base", { companyId: { $eq: user.companyId } })
  },

  UNIT_ADMIN(user, { can }) {
    can("manage", "User", { unitId: { $eq: user.unitId } })
    can("manage", "Unit", { id: user.unitId })
    can("manage", "Base", { unitId: { $eq: user.unitId } })
  },

  BASE_ADMIN(user, { can }) {
    can("manage", "User", { baseId: { $eq: user.baseId } })
    can("manage", "Base", { id: { $eq: user.baseId } })
  },
}
