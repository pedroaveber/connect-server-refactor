import { app } from "@/app";
import { createAmbulanceStatus } from "../routes/ambulance-status/create-ambulance-status";

export default function ambulanceStatusRoutes() {
  app.register(createAmbulanceStatus);
}
