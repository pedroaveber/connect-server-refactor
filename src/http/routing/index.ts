import { app } from "@/app";
import { healthCheck } from "../routes/health-check";
import ambulanceDestinationCommandsRoutes from "./ambulance-destination-commands-routes";
import ambulanceDocumentsRoutes from "./ambulance-documents-routes";
import ambulanceShiftsRoutes from "./ambulance-shifts-routes";
import ambulanceStatusRoutes from "./ambulance-status-routes";
import ambulancesRoutes from "./ambulances-routes";
import authenticationRoutes from "./authentication-routes";
import basesRoutes from "./bases-routes";
import chatRoutes from "./chat-routes";
import companyGroupsRoutes from "./company-groups-routes";
import integrationsRoutes from "./integrations-routes";
import messagesRoutes from "./messages-routes";
import modulesRoutes from "./modules-routes";
import unitsRoutes from "./units-routes";

export default function Routing() {
  app.register(healthCheck);

  ambulanceDestinationCommandsRoutes();
  ambulanceDocumentsRoutes();
  ambulanceShiftsRoutes()
  ambulanceStatusRoutes()
  ambulancesRoutes()
  authenticationRoutes();
  basesRoutes()
  chatRoutes()
  companyGroupsRoutes()
  integrationsRoutes()
  messagesRoutes()
  modulesRoutes()
  unitsRoutes()
}
