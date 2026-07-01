import { whitelistedProcedure } from "../context";
import { t } from "../trpc";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateSettingsSchema = z.object({
  xenditWebhookToken: z.string().optional(),
  emailWhitelist: z.string().optional(),
});

export const settingsRouter = t.router({
  get: whitelistedProcedure.query(({ ctx }) => ctx.settings),
  update: whitelistedProcedure
    .input(updateSettingsSchema)
    .mutation(async ({ ctx, input }) => {
      return prisma.settings.update({
        where: { id: ctx.settings.id },
        data: {
          xenditWebhookToken: input.xenditWebhookToken ?? null,
          emailWhitelist: input.emailWhitelist ?? null,
        },
      });
    }),
});
