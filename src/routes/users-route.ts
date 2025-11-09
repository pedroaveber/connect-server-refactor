import { app } from "@/app";
import { createUser } from "@/http/controllers/users/create-user";
import { deleteUser } from "@/http/controllers/users/delete-user";
import { getUsers } from "@/http/controllers/users/get-users";
import { updateUser } from "@/http/controllers/users/update-user";

export default function usersRoute() {
  app.register(createUser);
  app.register(deleteUser);
  app.register(getUsers);
  app.register(updateUser);
}
