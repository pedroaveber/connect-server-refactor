import { app } from "@/app";
import { createCompanyGroup } from "@/http/controllers/company-groups/create-company-group";
import { createCompanyGroupPhoneNumber } from "@/http/controllers/company-groups/create-company-group-phone-number";
import { deleteCompanyGroup } from "@/http/controllers/company-groups/delete-company-group";
import { deleteCompanyGroupPhoneNumber } from "@/http/controllers/company-groups/delete-company-group-phone-number";
import { getCompanyGroup } from "@/http/controllers/company-groups/get-company-group";
import { getCompanyGroupPhones } from "@/http/controllers/company-groups/get-company-group-phones";
import { getCompanyGroups } from "@/http/controllers/company-groups/get-company-groups";
import { updateCompanyGroup } from "@/http/controllers/company-groups/update-company-group";

export default function companyGroupsRoutes() {
  app.register(createCompanyGroup);
  app.register(updateCompanyGroup);
  app.register(deleteCompanyGroup);
  app.register(getCompanyGroups);
  app.register(getCompanyGroup);
  app.register(createCompanyGroupPhoneNumber);
  app.register(deleteCompanyGroupPhoneNumber);
  app.register(getCompanyGroupPhones);
}
