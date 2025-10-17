import { encrypt as cryptoEncrypt } from "@/crypto";
import { env } from "@/env";
import type { FastifyReply, FastifyRequest } from "fastify";

export async function encrypt(
	_request: FastifyRequest,
	reply: FastifyReply,
	payload: unknown,
) {
	if (!payload) return payload;

	if (reply.statusCode >= 300) {
		return payload;
	}

	let jsonData: unknown;

	if (typeof payload === "string") {
		try {
			jsonData = JSON.parse(payload);
		} catch {
			jsonData = payload;
		}
	} else {
		jsonData = payload;
	}

	const encryptedContent = cryptoEncrypt(
		JSON.stringify(jsonData),
		env.CRYPTO_SECRET_KEY,
	);

	return JSON.stringify({
		content: encryptedContent,
	});
}
