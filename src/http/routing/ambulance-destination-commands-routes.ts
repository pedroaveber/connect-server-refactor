import { app } from "@/app";
import { attendDestinationCommand } from "../routes/ambulance-destination-commands/attend-destination-commands";
import { createDestinationCommand } from "../routes/ambulance-destination-commands/create-ambulance-destination-commands";
import { deleteDestinationCommand } from "../routes/ambulance-destination-commands/delete-destination-command";
import { replaceDestinationCommand } from "../routes/ambulance-destination-commands/replace-destination-commands";

export default function ambulanceDestinationCommandsRoutes() {
  app.register(createDestinationCommand);
  app.register(replaceDestinationCommand);
  app.register(attendDestinationCommand);
  app.register(deleteDestinationCommand);
}
