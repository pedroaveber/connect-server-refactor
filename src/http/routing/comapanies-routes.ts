import { app } from "@/app";
import { createCompany } from "../routes/companies/create-company";
import { createCompanyPhoneNumber } from "../routes/companies/create-company-phone-number";
import { deleteCompany } from "../routes/companies/delete-company";
import { deleteCompanyPhoneNumber } from "../routes/companies/delete-company-phone-number";
import { getCompanies } from "../routes/companies/get-companies";
import { getCompany } from "../routes/companies/get-company";
import { updateCompany } from "../routes/companies/update-company";
import { updateCompanyModules } from "../routes/companies/update-company-modules";

export default function companiesRoutes() {
  app.register(createCompany);
  app.register(updateCompany);
  app.register(updateCompanyModules);
  app.register(deleteCompany);
  app.register(getCompanies);
  app.register(getCompany);
  app.register(createCompanyPhoneNumber);
  app.register(deleteCompanyPhoneNumber);
}
