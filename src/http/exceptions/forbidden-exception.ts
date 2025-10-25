export class ForbiddenException extends Error {
  constructor() {
    super("Forbidden")
    this.name = "ForbiddenException"
  }
}
