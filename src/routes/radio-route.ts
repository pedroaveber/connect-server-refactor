import { app } from "@/app";
import { radioAddParticipantToMeeting } from "@/http/controllers/radio/add-participant";
import { radioCreateMeeting } from "@/http/controllers/radio/create-meeting";
import { radioRemoveParticipantToMeeting } from "@/http/controllers/radio/remove-participant";

export default function radioRoute() {
  app.register(radioCreateMeeting);
  app.register(radioAddParticipantToMeeting);
  app.register(radioRemoveParticipantToMeeting);
}
