import type { FastifyPluginAsync } from "fastify"
import { checkAuth } from "./auth/check-auth"
import { signIn } from "./auth/sign-in"
import { signOut } from "./auth/sign-out"
import { createBase } from "./base/create-base"
import { createBasePhoneNumber } from "./base/create-base-phone-number"
import { deleteBase } from "./base/delete-base"
import { deleteBasePhoneNumber } from "./base/delete-base-phone-number"
import { getBase } from "./base/get-base"
import { updateBase } from "./base/update-base"
import { createCompany } from "./companies/create-company"
import { createCompanyPhoneNumber } from "./companies/create-company-phone-number"
import { deleteCompany } from "./companies/delete-company"
import { deleteCompanyPhoneNumber } from "./companies/delete-company-phone-number"
import { getCompany } from "./companies/get-company"
import { getUnitsFromCompany } from "./companies/get-units-from-company"
import { updateCompany } from "./companies/update-company"
import { createCompanyGroup } from "./company-groups/create-company-group"
import { createCompanyGroupPhoneNumber } from "./company-groups/create-company-group-phone-number"
import { deleteCompanyGroup } from "./company-groups/delete-company-group"
import { deleteCompanyGroupPhoneNumber } from "./company-groups/delete-company-group-phone-number"
import { getCompaniesFromCompanyGroup } from "./company-groups/get-companies-from-company-group"
import { getCompanyGroup } from "./company-groups/get-company-group"
import { getCompanyGroups } from "./company-groups/get-company-groups"
import { updateCompanyGroup } from "./company-groups/update-company-group"
import { updateCompanyGroupInvoiceMode } from "./company-groups/update-company-group-invoice-mode"
import { getHierarchies } from "./hierarchies/get-hierarchies"
import { createUnit } from "./units/create-unit"
import { deleteUnit } from "./units/delete-unit"
import { getBasesFromUnit } from "./units/get-bases-from-unit"
import { getUnit } from "./units/get-unit"
import { updateUnit } from "./units/update-unit"
import { getUserOrganizations } from "./users/get-user-organizations"

// biome-ignore lint/suspicious/useAwait: <Function must be async>
export const appRoutes: FastifyPluginAsync = async (app) => {
  // Authentication Routes
  app.register(signIn)
  app.register(signOut)
  app.register(checkAuth)

  // Hierarchy Routes
  app.register(getHierarchies)

  // Company Group Routes
  app.register(createCompanyGroup)
  app.register(getCompanyGroups)
  app.register(getCompanyGroup)
  app.register(getCompaniesFromCompanyGroup)
  app.register(updateCompanyGroup)
  app.register(deleteCompanyGroup)
  app.register(createCompanyGroupPhoneNumber)
  app.register(deleteCompanyGroupPhoneNumber)
  app.register(updateCompanyGroupInvoiceMode)

  // Company Routes
  app.register(getCompany)
  app.register(createCompany)
  app.register(updateCompany)
  app.register(getUnitsFromCompany)
  app.register(createCompanyPhoneNumber)
  app.register(deleteCompanyPhoneNumber)
  app.register(deleteCompany)

  // Unit Routes
  app.register(getUnit)
  app.register(createUnit)
  app.register(updateUnit)
  app.register(getBasesFromUnit)
  app.register(deleteUnit)

  // Base Routes
  app.register(createBase)
  app.register(getBase)
  app.register(updateBase)
  app.register(deleteBase)
  app.register(createBasePhoneNumber)
  app.register(deleteBasePhoneNumber)

  // User Routes
  app.register(getUserOrganizations)
}
