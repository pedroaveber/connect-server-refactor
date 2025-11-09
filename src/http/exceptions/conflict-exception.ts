import { HttpException } from "./http-exception"

export class ConflictException extends HttpException {
  constructor(message = "Conflito") {
    super(409, message, "ConflictException", "E006")
  }
}
