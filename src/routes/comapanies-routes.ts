import { app } from "@/app";
import { createCompany } from "@/http/controllers/companies/create-company";
import { createCompanyPhoneNumber } from "@/http/controllers/companies/create-company-phone-number";
import { deleteCompany } from "@/http/controllers/companies/delete-company";
import { deleteCompanyPhoneNumber } from "@/http/controllers/companies/delete-company-phone-number";
import { getCompanies } from "@/http/controllers/companies/get-companies";
import { getCompany } from "@/http/controllers/companies/get-company";
import { updateCompany } from "@/http/controllers/companies/update-company";

export default function companiesRoutes() {
  app.register(createCompany);
  app.register(updateCompany);
  app.register(deleteCompany);
  app.register(getCompanies);
  app.register(getCompany);
  app.register(createCompanyPhoneNumber);
  app.register(deleteCompanyPhoneNumber);
}
