import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { auth } from "@/http/hooks/auth";
import { env } from "@/env";
import { prisma } from "@/database/prisma";

export const radioRemoveParticipantToMeeting: FastifyPluginCallbackZod = (
  app
) => {
  app.delete(
    "/radio/remove-participant",
    {
      preHandler: [auth],
      schema: {
        tags: ["Radio"],
        summary: "Remove a participant from a radio meeting",
        operationId: "removeRadioParticipant",
        body: z.object({
          meetingId: z.string(),
          participantId: z.string(),
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

      const { meetingId, participantId } = request.body;

      const url =
        env.CLOUDFARE_REALTIME_API_URL +
        "/meetings/" +
        meetingId +
        "/participants/" +
        participantId;

      const ORGANIZATION_ID = env.CLOUDFARE_ORGANIZATION_ID;
      const API_KEY = env.CLOUDFARE_API_KEY;
      const authString = Buffer.from(`${ORGANIZATION_ID}:${API_KEY}`).toString(
        "base64"
      );

      try {
        const response = await fetch(url, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Basic ${authString}`,
          },
        });

        const responseJson: any = await response.json();

        return reply
          .status(201)
          .send({ id: responseJson.data.custom_participant_id });
      } catch (error) {
        console.error(error);
      }
    }
  );
};
