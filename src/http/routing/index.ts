import { app } from "@/app";
import { healthCheck } from "../routes/health-check";
import { getPressignedUrl } from "../routes/upload/upload";
import ambulanceDestinationCommandsRoutes from "./ambulance-destination-commands-routes";
import ambulanceDocumentsRoutes from "./ambulance-documents-routes";
import ambulanceShiftsRoutes from "./ambulance-shifts-routes";
import ambulanceStatusRoutes from "./ambulance-status-routes";
import ambulancesRoutes from "./ambulances-routes";
import authenticationRoutes from "./authentication-routes";
import basesRoutes from "./bases-routes";
import chatRoutes from "./chat-routes";
import companiesRoutes from "./comapanies-routes";
import companyGroupsRoutes from "./company-groups-routes";
import integrationsRoutes from "./integrations-routes";
import messagesRoutes from "./messages-routes";
import modulesRoutes from "./modules-routes";
import rolesRoutes from "./roles-routes";
import unitsRoutes from "./units-routes";
import usersRoute from "./users-route";

export default function Routing() {
  app.register(healthCheck);
  app.register(getPressignedUrl)

  ambulanceDestinationCommandsRoutes();
  ambulanceDocumentsRoutes();
  ambulanceShiftsRoutes()
  ambulanceStatusRoutes()
  ambulancesRoutes()
  authenticationRoutes();
  basesRoutes()
  chatRoutes()
  companiesRoutes()
  companyGroupsRoutes()
  integrationsRoutes()
  messagesRoutes()
  modulesRoutes()
  rolesRoutes()
  unitsRoutes()
  usersRoute()
}
