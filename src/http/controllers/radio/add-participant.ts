import type { FastifyPluginCallbackZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { permissions } from "@/data/permissions";
import { auth } from "@/http/hooks/auth";
import { env } from "@/env";
import { prisma } from "@/database/prisma";
import { ably } from "@/utils/ably";

export const radioAddParticipantToMeeting: FastifyPluginCallbackZod = (app) => {
  app.post(
    "/radio/add-participant",
    {
      preHandler: [auth],
      schema: {
        tags: ["Radio"],
        summary: "Add a participant to a radio meeting",
        operationId: "addRadioParticipant",
        body: z.object({
          meetingId: z.string(),
          name: z.string(),
          preset_name: z.string(),
          custom_participant_id: z.string(),
          ambulanceId: z.string(),
        }),

        response: {
          201: z.object({ id: z.string(), token: z.string() }),
        },
      },
    },

    async (request, reply) => {
      const ambulance = await prisma.ambulance.findUnique({
        where: { id: request.body.ambulanceId },
        select: { id: true, unitId: true, companyGroupId: true },
      });
      await request.authorize({
        permission: permissions.base.create,
        target: { unitId: ambulance?.unitId },
      });

      const { meetingId, name, preset_name, custom_participant_id } =
        request.body;

      const url =
        env.CLOUDFARE_REALTIME_API_URL +
        "/meetings/" +
        meetingId +
        "/participants";

      const ORGANIZATION_ID = env.CLOUDFARE_ORGANIZATION_ID;
      const API_KEY = env.CLOUDFARE_API_KEY;
      const authString = Buffer.from(`${ORGANIZATION_ID}:${API_KEY}`).toString(
        "base64"
      );

      const body = {
        name,
        preset_name,
        custom_participant_id,
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

        const channel = ably.channels.get(
          `connect-${ambulance?.companyGroupId}`
        );

        channel.publish("radioCall", {
          ambulanceId: ambulance?.id,
          meetingId: meetingId,
          type: "CALLING",
        });

        return reply
          .status(201)
          .send({ id: responseJson.data.id, token: responseJson.data.token });
      } catch (error) {
        console.error(error);
      }
    }
  );
};
