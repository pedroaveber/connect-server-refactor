import { app } from "@/app";
import { updateAmbulanceDocumentsInBulk } from "../routes/ambulance-documents/bulk-update-ambulance-documents";
import { createAmbulanceDocuments } from "../routes/ambulance-documents/create-ambulance-documents";
import { deleteAmbulanceDocument } from "../routes/ambulance-documents/delete-ambulance-documents";
import { updateAmbulanceDocument } from "../routes/ambulance-documents/update-ambulance-documents";

export default function ambulanceDocumentsRoutes() {
  app.register(createAmbulanceDocuments)
  app.register(updateAmbulanceDocument)
  app.register(updateAmbulanceDocumentsInBulk)
  app.register(deleteAmbulanceDocument)
}
