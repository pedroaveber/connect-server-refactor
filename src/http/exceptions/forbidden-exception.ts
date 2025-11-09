import { HttpException } from "./http-exception"

export class ForbiddenException extends HttpException {
  constructor(message = "Acesso negado") {
    super(403, message, "ForbiddenException", "E004")
  }
}
