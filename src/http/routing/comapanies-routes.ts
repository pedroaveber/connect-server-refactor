import { app } from "@/app";
import { createCompany } from "../routes/companies/create-company";
import { createCompanyPhoneNumber } from "../routes/companies/create-company-phone-number";
import { deleteCompany } from "../routes/companies/delete-company";
import { deleteCompanyPhoneNumber } from "../routes/companies/delete-company-phone-number";
import { getCompanies } from "../routes/companies/get-units-from-company";
import { getCompany } from "../routes/companies/get-company";
import { updateCompany } from "../routes/companies/update-company";
import { updateCompanyModule } from "../routes/companies/update-company-module";
import { updateCompanyHierarchy } from "../routes/companies/update-company-hierarchy";
import { getCompanyModules } from "../routes/companies/get-company-modules";

export default function companiesRoutes() {
  app.register(createCompany);
  app.register(updateCompany);
  app.register(updateCompanyModule);
  app.register(deleteCompany);
  app.register(getCompanies);
  app.register(getCompany);
  app.register(getCompanyModules);
  app.register(createCompanyPhoneNumber);
  app.register(deleteCompanyPhoneNumber);
  app.register(updateCompanyHierarchy);
}
