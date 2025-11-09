import type { FastifyPluginAsync } from "fastify"
import { createAmbulanceDocument } from "./ambulances/create-ambuance-document"
import { createAmbulance } from "./ambulances/create-ambulance"
import { deleteAmbulance } from "./ambulances/delete-ambulance"
import { deleteAmbulanceDocument } from "./ambulances/delete-ambulance-document"
import { getAmbulance } from "./ambulances/get-ambulance"
import { switchAmbulanceBase } from "./ambulances/switch-ambulance-base"
import { switchAmbulanceStatus } from "./ambulances/switch-ambulance-status"
import { updateAmbulance } from "./ambulances/update-ambulance"
import { checkAuth } from "./auth/check-auth"
import { signIn } from "./auth/sign-in"
import { signOut } from "./auth/sign-out"
import { createBase } from "./base/create-base"
import { createBasePhoneNumber } from "./base/create-base-phone-number"
import { deleteBase } from "./base/delete-base"
import { deleteBasePhoneNumber } from "./base/delete-base-phone-number"
import { getAmbulancesFromBase } from "./base/get-ambulances-from-base"
import { getBase } from "./base/get-base"
import { getBases } from "./base/get-bases"
import { updateBase } from "./base/update-base"
import { createCompany } from "./companies/create-company"
import { createCompanyPhoneNumber } from "./companies/create-company-phone-number"
import { deleteCompany } from "./companies/delete-company"
import { deleteCompanyPhoneNumber } from "./companies/delete-company-phone-number"
import { getCompanies } from "./companies/get-companies"
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
import { getUnits } from "./units/get-units"
import { updateUnit } from "./units/update-unit"
import { createBatchUsers } from "./users/create-batch-users"
import { createUser } from "./users/create-user"
import { getAuthenticatedUser } from "./users/get-authenticated-user"
import { getCompaniesFromUser } from "./users/get-companies-from-user"
import { getUserOrganizations } from "./users/get-user-organizations"
import { getUsers } from "./users/get-users"

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
  app.register(getCompanies)

  // Unit Routes
  app.register(getUnit)
  app.register(createUnit)
  app.register(updateUnit)
  app.register(getBasesFromUnit)
  app.register(deleteUnit)
  app.register(getUnits)

  // Base Routes
  app.register(createBase)
  app.register(getBase)
  app.register(getBases)
  app.register(updateBase)
  app.register(deleteBase)
  app.register(createBasePhoneNumber)
  app.register(deleteBasePhoneNumber)
  app.register(getAmbulancesFromBase)

  // Ambulance Routes
  app.register(createAmbulance)
  app.register(getAmbulance)
  app.register(updateAmbulance)
  app.register(deleteAmbulance)
  app.register(switchAmbulanceStatus)
  app.register(switchAmbulanceBase)
  app.register(createAmbulanceDocument)
  app.register(deleteAmbulanceDocument)

  // User Routes
  app.register(getUserOrganizations)
  app.register(getAuthenticatedUser)
  app.register(getUsers)
  app.register(createUser)
  app.register(createBatchUsers)
  app.register(getCompaniesFromUser)
}
