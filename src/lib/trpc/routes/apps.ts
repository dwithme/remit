import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { whitelistedProcedure } from "../context";
import { t } from "../trpc";
import { TRPCError } from "@trpc/server";

const appSelect = {
  id: true,
  name: true,
  prefix: true,
  webhookUrl: true,
  createdAt: true,
  updatedAt: true,
} as const;

const transactionSelect = {
  id: true,
  externalId: true,
  amount: true,
  status: true,
  createdAt: true,
} as const;

const appCreateSchema = z.object({
  name: z.string().min(1),
  prefix: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9_-]+$/i, "Use letters/numbers/_/- only"),
  webhookUrl: z.string().url(),
});

const appUpdateSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).optional(),
  prefix: z
    .string()
    .min(1)
    .max(32)
    .regex(/^[a-z0-9_-]+$/i, "Use letters/numbers/_/- only")
    .optional(),
  webhookUrl: z.string().url().optional(),
});

const normalizePrefix = (prefix: string) => prefix.trim().toLowerCase();

const assertUniquePrefix = async (prefix: string, excludeAppId?: string) => {
  const existing = await prisma.app.findUnique({ where: { prefix } });
  if (existing && existing.id !== excludeAppId) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Prefix "${prefix}" is already used by another app`,
    });
  }
};

export const appsRouter = t.router({
  list: whitelistedProcedure.query(async () => {
    return prisma.app.findMany({
      orderBy: { createdAt: "desc" },
      select: appSelect,
    });
  }),

  get: whitelistedProcedure
    .input(
      z.object({
        id: z.string().min(1),
        includeTransactions: z.boolean().optional().default(false),
      }),
    )
    .query(async ({ input }) => {
      return prisma.app.findUnique({
        where: { id: input.id },
        select: {
          ...appSelect,
          ...(input.includeTransactions
            ? {
                txns: {
                  orderBy: { createdAt: "desc" },
                  take: 50,
                  select: transactionSelect,
                },
              }
            : {}),
        },
      });
    }),

  create: whitelistedProcedure
    .input(appCreateSchema)
    .mutation(async ({ input }) => {
      const prefix = normalizePrefix(input.prefix);
      await assertUniquePrefix(prefix);

      return prisma.app.create({
        data: {
          name: input.name.trim(),
          prefix,
          webhookUrl: input.webhookUrl,
          baseUrl: `/api/apps/${prefix}`,
        },
        select: appSelect,
      });
    }),

  update: whitelistedProcedure
    .input(appUpdateSchema)
    .mutation(async ({ input }) => {
      const nextPrefix = input.prefix ? normalizePrefix(input.prefix) : undefined;
      if (nextPrefix) {
        await assertUniquePrefix(nextPrefix, input.id);
      }

      return prisma.app.update({
        where: { id: input.id },
        data: {
          name: input.name?.trim(),
          prefix: nextPrefix,
          webhookUrl: input.webhookUrl,
          ...(nextPrefix ? { baseUrl: `/api/apps/${nextPrefix}` } : {}),
        },
        select: appSelect,
      });
    }),

  remove: whitelistedProcedure
    .input(z.object({ id: z.string().min(1) }))
    .mutation(async ({ input }) => {
      await prisma.app.delete({ where: { id: input.id } });
      return { ok: true };
    }),
});
