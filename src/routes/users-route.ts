import { app } from "@/app";
import { env } from "@/env";
import { createUser } from "@/http/controllers/users/create-user";
import { deleteUser } from "@/http/controllers/users/delete-user";
import { getAuthenticatedUser } from "@/http/controllers/users/get-authenticated-user";
import { getAuthenticatedUserShiftValidation } from "@/http/controllers/users/get-authenticated-user-shift-validation";
import { getUser } from "@/http/controllers/users/get-user";
import { getUsers } from "@/http/controllers/users/get-users";
import { initUser } from "@/http/controllers/users/init-user";
import { updateUserPermissions } from "@/http/controllers/users/update-permissions";
import { updateUser } from "@/http/controllers/users/update-user";

export default function usersRoute() {
  app.register(createUser);
  app.register(deleteUser);
  app.register(getUsers);
  app.register(updateUser);
  app.register(updateUserPermissions);
  app.register(getAuthenticatedUser);
  app.register(getUser);
  app.register(getAuthenticatedUserShiftValidation);

  if (env.ENV === "development") {
    app.register(initUser);
  }
}
