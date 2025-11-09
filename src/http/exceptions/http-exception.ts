// src/exceptions/http-exception.ts
export class HttpException extends Error {
  statusCode: number
  code?: string

  constructor(
    statusCode: number,
    message: string,
    name: string,
    code?: string
  ) {
    super(message)
    this.name = name
    this.statusCode = statusCode
    this.code = code
    Object.setPrototypeOf(this, HttpException.prototype)
  }
}
