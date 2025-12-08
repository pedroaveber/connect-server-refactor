import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { auth } from "@/http/hooks/auth";
import { env } from "@/env";
import { prisma } from "@/database/prisma";

export const radioCreateMeeting: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/radio/create-meeting",
    {
      preHandler: [auth],
      schema: {
        tags: ["Radio"],
        summary: "Create a radio meeting",
        operationId: "createRadioMeeting",
        body: z.object({
          title: z.string(),
          ambulanceId: z.string(),
        }),
        response: {
          201: z.object({ id: z.string() }),
        },
      },
    },

    async (request, reply) => {
      const ambulance = await prisma.ambulance.findUnique({
        where: { id: request.body.ambulanceId },
        select: { unitId: true },
      });
      await request.authorize({
        permission: permissions.base.create,
        target: { unitId: ambulance?.unitId },
      });

      const { title } = request.body;

      const url = env.CLOUDFARE_REALTIME_API_URL + "/meetings";

      const ORGANIZATION_ID = env.CLOUDFARE_ORGANIZATION_ID;
      const API_KEY = env.CLOUDFARE_API_KEY;
      const authString = Buffer.from(`${ORGANIZATION_ID}:${API_KEY}`).toString(
        "base64"
      );

      const body = {
        title,
        preferred_region: "ap-south-1",
      };

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${authString}`,
          },
          body: JSON.stringify(body),
        });

        const responseJson: any = await response.json();

        return reply.status(201).send({ id: responseJson?.data?.id });
      } catch (error) {
        console.error(error);
      }
    }
  );
};
