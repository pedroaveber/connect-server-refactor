import { app } from "./app";
import { attendDestinationCommand } from "./http/routes/ambulance-destination-commands/attend-destination-commands";
import { createDestinationCommand } from "./http/routes/ambulance-destination-commands/create-ambulance-destination-commands";
import { deleteDestinationCommand } from "./http/routes/ambulance-destination-commands/delete-destination-command";
import { replaceDestinationCommand } from "./http/routes/ambulance-destination-commands/replace-destination-commands";
import { updateAmbulanceDocumentsInBulk } from "./http/routes/ambulance-documents/bulk-update-ambulance-documents";
import { createAmbulanceDocuments } from "./http/routes/ambulance-documents/create-ambulance-documents";
import { deleteAmbulanceDocument } from "./http/routes/ambulance-documents/delete-ambulance-documents";
import { updateAmbulanceDocument } from "./http/routes/ambulance-documents/update-ambulance-documents";
import { createAmbulanceShift } from "./http/routes/ambulance-shifts/create-ambulance-shift";
import { createAmbulanceStatus } from "./http/routes/ambulance-status/create-ambulance-status";
import { createAmbulance } from "./http/routes/ambulances/create-ambulance";
import { deleteAmbulance } from "./http/routes/ambulances/delete-ambulance";
import { getAmbulance } from "./http/routes/ambulances/get-ambulance";
import { getAmbulances } from "./http/routes/ambulances/get-ambulances";
import { updateAmbulance } from "./http/routes/ambulances/update-ambulance";
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

  // Ambulances
  app.register(createAmbulance)
  app.register(updateAmbulance)
  app.register(getAmbulance)
  app.register(getAmbulances)
  app.register(deleteAmbulance)

  // Ambulance Destination Commands
  app.register(createDestinationCommand)
  app.register(replaceDestinationCommand)
  app.register(attendDestinationCommand)
  app.register(deleteDestinationCommand)

  // Ambulance Documents
  app.register(createAmbulanceDocuments)
  app.register(updateAmbulanceDocument)
  app.register(updateAmbulanceDocumentsInBulk)
  app.register(deleteAmbulanceDocument)

  // Ambulance Shifts
  app.register(createAmbulanceShift)

  // Ambulance Statuses
  app.register(createAmbulanceStatus)
}
