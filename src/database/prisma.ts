import { handlePrismaError } from "@/http/exceptions/handler/prisma-error-handler";
import { PrismaException } from "@/http/exceptions/prisma-exception";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export const prisma = new PrismaClient()
  .$extends({
    query: {
      $allModels: {
        async $allOperations({
          args,
          query,
        }: {
          args: any;
          query: (args: any) => Promise<any>;
        }) {
          try {
            // Executa a query de fato
            const result = await query(args);
            return result;
          } catch (error: any) {
            const errorMessage = handlePrismaError(error);
            throw new PrismaException(errorMessage);
          }
        },
      },
    },
  })
  .$extends(withAccelerate());
