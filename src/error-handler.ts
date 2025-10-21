import { FastifyInstance } from "fastify"
import { env } from "./env"
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod"

type FastifyErrorHandler = FastifyInstance["errorHandler"]

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (env.ENV !== 'production') {
    console.error(error)
  }

  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(422).send({
      code: 'E001',
      message: 'Requisição inválida',
      details: {
        issues: error.validation.map(({ message }) => message).join(', '),
        method: request.method,
        url: request.url,
      }
    })
  }

  switch (error.name) {
    case 'BadRequestException': {
      return reply.status(400).send({
        code: 'E002',
        message: 'Requisição inválida',
        details: {
          message: error.message,
          method: request.method,
          url: request.url,
        }
      })
    }
    case 'UnauthorizedException': {
      return reply.status(401).send({
        code: 'E003',
        message: 'Não autorizado',
        details: {
          message: error.message,
        }
      })
    }
    case 'ForbiddenException': {
      return reply.status(403).send({
        code: 'E004',
        message: 'Forbidden',
        details: {
          message: error.message,
        }
      })
    }

    case 'ResourceNotFoundException': {
      return reply.status(404).send({
        code: 'E005',
        message: 'Recurso não encontrado',
        details: {
          message: error.message,
        }
      })
    }

    case 'ConflictException': {
      return reply.status(409).send({
        code: 'E006',
        message: 'Conflito',
        details: {
          message: error.message,
        }
      })
    }

    default: {
      return reply.status(500).send({
        code: 'E007',
        message: 'Erro interno do servidor',
        details: {
          message: error.message,
        }
      })
    }
  }
}