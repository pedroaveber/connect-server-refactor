import {
  AbilityBuilder,
  CreateAbility,
  createMongoAbility,
  MongoAbility,
} from '@casl/ability'
import { User } from './models/user'
import { permissions } from './permissions'
import { z } from 'zod'
import { companyGroupSubject } from './subjects/company-group'
import { companySubject } from './subjects/company'
import { unitSubject } from './subjects/unit'
import { userSubject } from './subjects/user'
import { baseSubject } from './subjects/base'

const appAbilitiesSchema = z.union([
  userSubject,
  companyGroupSubject,
  companySubject,
  unitSubject,
  baseSubject,
  z.tuple([z.literal('manage'), z.literal('all')]),
])

type AppAbilities = z.infer<typeof appAbilitiesSchema>

export type AppAbility = MongoAbility<AppAbilities>
export const createAppAbility = createMongoAbility as CreateAbility<AppAbility>

export function defineAbilityFor(user: User) {
  const builder = new AbilityBuilder(createAppAbility)

  if (typeof permissions[user.role] !== 'function') {
    throw new Error(`Permission not found for role: ${user.role}`)
  }

  permissions[user.role](user, builder)

  const ability = builder.build({
    detectSubjectType: (object) => object.__typename,
  })

  ability.can = ability.can.bind(ability)
  ability.cannot = ability.cannot.bind(ability)

  return ability
}