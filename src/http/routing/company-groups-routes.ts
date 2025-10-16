import { app } from "@/app";
import { createCompanyGroup } from "../routes/company-group/create-company-group";
import { createCompanyGroupPhoneNumber } from "../routes/company-group/create-company-group-phone-number";
import { deleteCompanyGroup } from "../routes/company-group/delete-company-group";
import { deleteCompanyGroupPhoneNumber } from "../routes/company-group/delete-company-group-phone-number";
import { getCompanyGroup } from "../routes/company-group/get-company-group";
import { getCompanyGroups } from "../routes/company-group/get-company-groups";
import { updateCompanyGroup } from "../routes/company-group/update-company-group";

export default function companyGroupsRoutes() {
  app.register(createCompanyGroup);
  app.register(updateCompanyGroup);
  app.register(deleteCompanyGroup);
  app.register(getCompanyGroups);
  app.register(getCompanyGroup);
  app.register(createCompanyGroupPhoneNumber);
  app.register(deleteCompanyGroupPhoneNumber);
}
