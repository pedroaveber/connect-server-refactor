import { app } from "@/app";
import { checkAuth } from "../routes/auth/check-auth";
import { signIn } from "../routes/auth/sign-in";
import { signOut } from "../routes/auth/sign-out";

export default function authenticationRoutes() {
  app.register(signIn);
  app.register(signOut);
  app.register(checkAuth);
}
