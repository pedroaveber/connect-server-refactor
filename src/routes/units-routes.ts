import { app } from "@/app";
import { createUnit } from "@/http/controllers/units/create-unit";
import { deleteUnit } from "@/http/controllers/units/delete-unit";
import { deleteUnitPhoneNumber } from "@/http/controllers/units/delete-unit-phone-number";
import { getUnit } from "@/http/controllers/units/get-unit";
import { getUnits } from "@/http/controllers/units/get-units";
import { updateUnit } from "@/http/controllers/units/update-unit";

export default function unitsRoutes() {
  app.register(createUnit);
  app.register(updateUnit);
  app.register(deleteUnit);
  app.register(getUnits);
  app.register(getUnit);
  app.register(deleteUnitPhoneNumber);
}
