// src/error-handler.ts
import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { env } from "./env";
import { HttpException } from "./http/exceptions/http-exception";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  console.log({ error });
  if (env.ENV !== "production") {
    console.error(error);
  }

  // 🔹 Erros de validação do Zod
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(422).send({
      code: "E001",
      message: "Requisição inválida",
      details: {
        issues: error.validation.map(({ message }) => message).join(", "),
        method: request.method,
        url: request.url,
      },
    });
  }

  // 🔹 Erros customizados (HttpException)
  if (error instanceof HttpException) {
    return reply.status(error.statusCode).send({
      code: error.code ?? "E999",
      message: error.message,
      details: {
        method: request.method,
        url: request.url,
      },
    });
  }

  // 🔹 Fallback para erros não tratados
  return reply.status(500).send({
    code: "E007",
    message: "Erro interno do servidor",
    details: {
      message: error.message,
      method: request.method,
      url: request.url,
    },
  });
};
