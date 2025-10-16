import { app } from "@/app";
import { createAmbulance } from "../routes/ambulances/create-ambulance";
import { deleteAmbulance } from "../routes/ambulances/delete-ambulance";
import { getAmbulance } from "../routes/ambulances/get-ambulance";
import { getAmbulances } from "../routes/ambulances/get-ambulances";
import { updateAmbulance } from "../routes/ambulances/update-ambulance";

export default function ambulancesRoutes() {
  app.register(createAmbulance);
  app.register(updateAmbulance);
  app.register(getAmbulance);
  app.register(getAmbulances);
  app.register(deleteAmbulance);
}
