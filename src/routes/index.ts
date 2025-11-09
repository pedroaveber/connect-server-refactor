import { app } from "@/app";
import ambulanceDocumentsRoutes from "./ambulance-documents-routes";
import ambulancesRoutes from "./ambulances-routes";
import authenticationRoutes from "./authentication-routes";
import basesRoutes from "./bases-routes";
import companiesRoutes from "./comapanies-routes";
import companyGroupsRoutes from "./company-groups-routes";
import unitsRoutes from "./units-routes";
import usersRoute from "./users-route";
import { healthCheck } from "@/http/controllers/health-check";
import { getPressignedUrl } from "@/http/controllers/upload/upload";

export default function Routing() {
  app.register(healthCheck);
  app.register(getPressignedUrl);

  ambulanceDocumentsRoutes();
  ambulancesRoutes();
  authenticationRoutes();
  basesRoutes();
  companiesRoutes();
  companyGroupsRoutes();
  unitsRoutes();
  usersRoute();
}
