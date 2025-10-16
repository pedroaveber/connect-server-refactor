import { app } from "./app";
import { checkAuth } from "./http/routes/auth/check-auth";
import { signIn } from "./http/routes/auth/sign-in";
import { signOut } from "./http/routes/auth/sign-out";
import { createCompany } from "./http/routes/companies/create-company";
import { createCompanyPhoneNumber } from "./http/routes/companies/create-company-phone-number";
import { deleteCompany } from "./http/routes/companies/delete-company";
import { deleteCompanyPhoneNumber } from "./http/routes/companies/delete-company-phone-number";
import { getCompanies } from "./http/routes/companies/get-companies";
import { getCompany } from "./http/routes/companies/get-company";
import { updateCompany } from "./http/routes/companies/update-company";
import { updateCompanyModules } from "./http/routes/companies/update-company-modules";
import { createCompanyGroup } from "./http/routes/company-group/create-company-group";
import { createCompanyGroupPhoneNumber } from "./http/routes/company-group/create-company-group-phone-number";
import { deleteCompanyGroup } from "./http/routes/company-group/delete-company-group";
import { deleteCompanyGroupPhoneNumber } from "./http/routes/company-group/delete-company-group-phone-number";
import { getCompanyGroup } from "./http/routes/company-group/get-company-group";
import { getCompanyGroups } from "./http/routes/company-group/get-company-groups";
import { updateCompanyGroup } from "./http/routes/company-group/update-company-group";
import { healthCheck } from "./http/routes/health-check";
import { createUnit } from "./http/routes/units/create-unit";
import { createUnitPhoneNumber } from "./http/routes/units/create-unit-phone-number";
import { deleteUnit } from "./http/routes/units/delete-unit";
import { deleteUnitPhoneNumber } from "./http/routes/units/delete-unit-phone-number";
import { getUnit } from "./http/routes/units/get-unit";
import { getUnits } from "./http/routes/units/get-units";
import { updateUnit } from "./http/routes/units/update-unit";

export default function Routing() {
  // Http Routes
  app.register(healthCheck);

  // Authentication
  app.register(signIn);
  app.register(signOut);
  app.register(checkAuth);

  // Company Groups
  app.register(createCompanyGroup);
  app.register(updateCompanyGroup);
  app.register(deleteCompanyGroup);
  app.register(getCompanyGroups);
  app.register(getCompanyGroup);
  app.register(createCompanyGroupPhoneNumber);
  app.register(deleteCompanyGroupPhoneNumber);

  // Companies
  app.register(createCompany);
  app.register(updateCompany);
  app.register(updateCompanyModules)
  app.register(deleteCompany);
  app.register(getCompanies);
  app.register(getCompany);
  app.register(createCompanyPhoneNumber);
  app.register(deleteCompanyPhoneNumber);

  // Units
  app.register(createUnit);
  app.register(updateUnit);
  app.register(deleteUnit);
  app.register(getUnits);
  app.register(getUnit);
  app.register(createUnitPhoneNumber);
  app.register(deleteUnitPhoneNumber);
}
