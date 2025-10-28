import type { AbilityBuilder } from "@casl/ability"
import type { AppAbility } from "."
import type { User } from "./models/user"
import type { Role } from "./roles"

type PermissionsByRole = (
  user: User,
  builder: AbilityBuilder<AppAbility>
) => void

export const permissions: Record<Role, PermissionsByRole> = {
  ADMIN(_, { can }) {
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
  },

  MEMBER(user, { can }) {
    can("read", "User", {
      id: { $eq: user.id },
    })
  },
}
