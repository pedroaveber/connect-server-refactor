import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";

export const healthCheck: FastifyPluginCallbackZod = (app) => {
	app.get("/health", (_request, reply) => {
		return reply.status(200).send({
			status: "ok",
		});
	});
};
