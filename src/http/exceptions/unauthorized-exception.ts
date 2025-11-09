import { HttpException } from "./http-exception"

export class UnauthorizedException extends HttpException {
  constructor(message = "Não autorizado") {
    super(401, message, "UnauthorizedException", "E003")
  }
}
