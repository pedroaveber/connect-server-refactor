import { app } from "@/app";
import { associateToAmbulance } from "@/http/controllers/ambulances/associate-user-to-ambulance";
import { createAmbulance } from "@/http/controllers/ambulances/create-ambulance";
import { deassociateToAmbulance } from "@/http/controllers/ambulances/de-associate-user-to-ambulance";
import { deleteAmbulance } from "@/http/controllers/ambulances/delete-ambulance";
import { getAmbulance } from "@/http/controllers/ambulances/get-ambulance";
import { getAmbulanceDocuments } from "@/http/controllers/ambulances/get-ambulance-documents";
import { getAmbulancePhones } from "@/http/controllers/ambulances/get-ambulance-phones";
import { getAmbulances } from "@/http/controllers/ambulances/get-ambulances";
import { getAmbulancesControl } from "@/http/controllers/ambulances/get-ambulances-control";
import { switchAmbulanceShift } from "@/http/controllers/ambulances/switch-ambulance-shift";
import { switchAmbulanceStatus } from "@/http/controllers/ambulances/switch-ambulance-status";
import { updateAmbulance } from "@/http/controllers/ambulances/update-ambulance";

export default function ambulancesRoutes() {
  app.register(createAmbulance);
  app.register(deleteAmbulance);
  app.register(getAmbulance);
  app.register(getAmbulancesControl);
  app.register(getAmbulances);
  app.register(switchAmbulanceStatus);
  app.register(switchAmbulanceShift);
  app.register(updateAmbulance);

  app.register(associateToAmbulance);
  app.register(deassociateToAmbulance);

  app.register(getAmbulanceDocuments);
  app.register(getAmbulancePhones);
}
