import { app } from "@/app";
import { createBase } from "../routes/base/create-base";
import { createBasePhoneNumber } from "../routes/base/create-base-phone-number";
import { deleteBase } from "../routes/base/delete-base";
import { deleteBasePhoneNumber } from "../routes/base/delete-base-phone-number";
import { getBase } from "../routes/base/get-base";
import { getBases } from "../routes/base/get-bases";
import { updateBase } from "../routes/base/update-base";

export default function basesRoutes() {
  app.register(createBase);
  app.register(updateBase);
  app.register(getBases);
  app.register(getBase);
  app.register(deleteBase);
  app.register(createBasePhoneNumber);
  app.register(deleteBasePhoneNumber);
}
