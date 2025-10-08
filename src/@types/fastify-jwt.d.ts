import "@fastify/jwt"

declare module "@fastify/jwt" {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: <Following the Fastify JWT types>
  interface FastifyJWT {
    payload: {
      sub: string
    }
  }
}
