import type { FastifyReply, FastifyRequest } from "fastify"
import { UnauthorizedException } from "../exceptions/unauthorized-exception"

export async function auth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const header = request.headers.authorization
    const cookie = request.cookies.accessToken
    
    if (!header) {
      request.headers.authorization = `Bearer ${cookie}`
    }
    
    await request.jwtVerify()
  } catch {
    throw new UnauthorizedException()
  }
}
