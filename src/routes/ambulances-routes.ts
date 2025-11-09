import { app } from "@/app";
import { createAmbulance } from "@/http/controllers/ambulances/create-ambulance";
import { deleteAmbulance } from "@/http/controllers/ambulances/delete-ambulance";
import { getAmbulance } from "@/http/controllers/ambulances/get-ambulance";
import { switchAmbulanceStatus } from "@/http/controllers/ambulances/switch-ambulance-status";
import { updateAmbulance } from "@/http/controllers/ambulances/update-ambulance";

export default function ambulancesRoutes() {
  app.register(createAmbulance);
  app.register(deleteAmbulance);
  app.register(getAmbulance);
  app.register(switchAmbulanceStatus);
  app.register(updateAmbulance);
}
