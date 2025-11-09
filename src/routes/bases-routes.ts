import { app } from "@/app";
import { createBase } from "@/http/controllers/base/create-base";
import { createBasePhoneNumber } from "@/http/controllers/base/create-base-phone-number";
import { deleteBase } from "@/http/controllers/base/delete-base";
import { deleteBasePhoneNumber } from "@/http/controllers/base/delete-base-phone-number";
import { getBase } from "@/http/controllers/base/get-base";
import { getBases } from "@/http/controllers/base/get-bases";
import { updateBase } from "@/http/controllers/base/update-base";

export default function basesRoutes() {
  app.register(createBase);
  app.register(updateBase);
  app.register(getBases);
  app.register(getBase);
  app.register(deleteBase);
  app.register(createBasePhoneNumber);
  app.register(deleteBasePhoneNumber);
}
