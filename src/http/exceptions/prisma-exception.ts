export class PrismaException extends Error {
  constructor(message?: string) {
    super(message || 'Prisma Exception')
    this.name = 'PrismException'
  }
}
