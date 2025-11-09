import { app } from "@/app";
import { updateAmbulanceDocumentsInBulk } from "@/http/controllers/ambulance-documents/bulk-update-ambulance-documents";
import { createAmbulanceDocuments } from "@/http/controllers/ambulance-documents/create-ambulance-documents";
import { deleteAmbulanceDocument } from "@/http/controllers/ambulance-documents/delete-ambulance-documents";
import { updateAmbulanceDocument } from "@/http/controllers/ambulance-documents/update-ambulance-documents";

export default function ambulanceDocumentsRoutes() {
  app.register(createAmbulanceDocuments);
  app.register(updateAmbulanceDocument);
  app.register(updateAmbulanceDocumentsInBulk);
  app.register(deleteAmbulanceDocument);
}
