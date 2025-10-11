import type { FastifyReply, FastifyRequest } from "fastify"
import { UnauthorizedException } from "../exceptions/unauthorized-exception"

export async function auth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedException()
  }
}
