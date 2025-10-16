import { app } from "@/app";
import { createUnit } from "../routes/units/create-unit";
import { createUnitPhoneNumber } from "../routes/units/create-unit-phone-number";
import { deleteUnit } from "../routes/units/delete-unit";
import { deleteUnitPhoneNumber } from "../routes/units/delete-unit-phone-number";
import { getUnit } from "../routes/units/get-unit";
import { getUnits } from "../routes/units/get-units";
import { updateUnit } from "../routes/units/update-unit";

export default function unitsRoutes() {
  app.register(createUnit);
  app.register(updateUnit);
  app.register(deleteUnit);
  app.register(getUnits);
  app.register(getUnit);
  app.register(createUnitPhoneNumber);
  app.register(deleteUnitPhoneNumber);
}
