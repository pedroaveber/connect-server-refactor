import {
  AbilityBuilder,
  type CreateAbility,
  createMongoAbility,
  type MongoAbility,
} from "@casl/ability"
import { z } from "zod"
import type { User } from "./models/user"
import { permissions } from "./permissions"
import { baseSubject } from "./subjects/base"
import { companySubject } from "./subjects/company"
import { companyGroupSubject } from "./subjects/company-group"
import { unitSubject } from "./subjects/unit"
import { userSubject } from "./subjects/user"

const appAbilitiesSchema = z.union([
  userSubject,
  companyGroupSubject,
  companySubject,
  unitSubject,
  baseSubject,
  z.tuple([z.literal("manage"), z.literal("all")]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (!user.roles || user.roles.length === 0) {
    throw new Error("User has no roles assigned")
  }

  for (const role of user.roles) {
    if (typeof permissions[role] !== "function") {
      throw new Error(`Permission not found for role: ${role}`)
    }

    permissions[role](user, builder)
  }

  const ability = builder.build({
    detectSubjectType: (object) => object.__typename,
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}
