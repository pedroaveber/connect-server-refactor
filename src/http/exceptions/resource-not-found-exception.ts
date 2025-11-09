import { HttpException } from "./http-exception"

export class ResourceNotFoundException extends HttpException {
  constructor(message = "Recurso não encontrado") {
    super(404, message, "ResourceNotFoundException", "E005")
  }
}
