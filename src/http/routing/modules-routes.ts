import { app } from "@/app";
import { createModule } from "../routes/modules/create-module";
import { deleteModule } from "../routes/modules/delete-module";
import { getModules } from "../routes/modules/get-modules";
import { updateModule } from "../routes/modules/update-module";

export default function modulesRoutes() {
  app.register(createModule);
  app.register(updateModule);
  app.register(getModules);
  app.register(deleteModule);
}
