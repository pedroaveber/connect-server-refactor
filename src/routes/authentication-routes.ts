import { app } from "@/app";
import { checkAuth } from "@/http/controllers/auth/check-auth";
import { signIn } from "@/http/controllers/auth/sign-in";
import { signOut } from "@/http/controllers/auth/sign-out";

export default function authenticationRoutes() {
  app.register(signIn);
  app.register(signOut);
  app.register(checkAuth);
}
