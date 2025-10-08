import type { FastifyReply, FastifyRequest } from "fastify"
import { decrypt as cryptoDecrypt } from "@/crypto"
import { env } from "@/env"

export function decrypt(request: FastifyRequest, _reply: FastifyReply) {
  if (!request.body) {
    return
  }

  const body =
    typeof request.body === "string" ? JSON.parse(request.body) : request.body

  if (body && typeof body.content === "string") {
    const decryptedData = cryptoDecrypt(body.content, env.CRYPTO_SECRET_KEY)

    // Parse the decrypted JSON and replace the body
    const decryptedJson = JSON.parse(decryptedData)
    request.body = decryptedJson
  }
}
