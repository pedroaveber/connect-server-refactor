import { app } from "@/app";
import { createModule } from "@/http/controllers/modules/create-module";
import { deleteModules } from "@/http/controllers/modules/delete-module";
import { getModule } from "@/http/controllers/modules/get-module";
import { getModules } from "@/http/controllers/modules/get-modules";
import { updateModule } from "@/http/controllers/modules/update-module";

export default function modulesRoutes() {
  app.register(createModule);
  app.register(updateModule);
  app.register(deleteModules);
  app.register(getModule);
  app.register(getModules);
}
