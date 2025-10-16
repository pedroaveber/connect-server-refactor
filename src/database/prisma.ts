import { handlePrismaError } from "@/http/exceptions/handler/prisma-error-handler";
import { PrismaException } from "@/http/exceptions/prisma-exception";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient().$extends({
  query: {
    $allModels: {
      async $allOperations({
        args,
        query,
      }: {
        args: unknown;
        query: (args: unknown) => Promise<unknown>;
      }) {
        try {
          // Executa a query de fato
          const result = await query(args);
          return result;
        } catch (error: unknown) {
          const errorMessage = handlePrismaError(error);
          throw new PrismaException(errorMessage);
        }
      },
    },
  },
});
