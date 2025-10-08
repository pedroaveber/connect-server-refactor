import { app } from "@/app"
import { env } from "@/env"

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    // biome-ignore lint/suspicious/noConsole: <Only for development>
    console.log(`🦊 Server is running on port ${env.PORT}`)
  })
