import { app } from "@/app"
import { createCompanyGroup } from "../routes/company-groups/create-company-group"
import { createCompanyGroupPhoneNumber } from "../routes/company-groups/create-company-group-phone-number"
import { deleteCompanyGroup } from "../routes/company-groups/delete-company-group"
import { deleteCompanyGroupPhoneNumber } from "../routes/company-groups/delete-company-group-phone-number"
import { getCompanyGroup } from "../routes/company-groups/get-company-group"
import { getCompanyGroups } from "../routes/company-groups/get-company-groups"
import { updateCompanyGroup } from "../routes/company-groups/update-company-group"

export default function companyGroupsRoutes() {
  app.register(createCompanyGroup)
  app.register(updateCompanyGroup)
  app.register(deleteCompanyGroup)
  app.register(getCompanyGroups)
  app.register(getCompanyGroup)
  app.register(createCompanyGroupPhoneNumber)
  app.register(deleteCompanyGroupPhoneNumber)
}
