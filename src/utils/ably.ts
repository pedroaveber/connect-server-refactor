import { env } from "@/env";
import * as Ably from "ably";

export const ably = new Ably.Realtime(env.ABLY_PRIVATE_KEY);
