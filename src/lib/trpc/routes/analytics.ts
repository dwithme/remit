import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { whitelistedProcedure } from "../context";
import { t } from "../trpc";
import { computeTotals } from "@/lib/transaction-analytics";

const txnSelect = {
  amount: true,
  status: true,
  createdAt: true,
  appId: true,
} as const;

const getRecentTransactions = async (appId?: string) => {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  return prisma.transaction.findMany({
    where: {
      createdAt: { gte: since },
      ...(appId ? { appId } : {}),
    },
    select: txnSelect,
    orderBy: { createdAt: "desc" },
  });
};

export const analyticsRouter = t.router({
  overview: whitelistedProcedure.query(async () => {
    const [txns, apps] = await Promise.all([
      getRecentTransactions(),
      prisma.app.findMany({
        select: { id: true, name: true, prefix: true },
        orderBy: { name: "asc" },
      }),
    ]);

    const appMeta = new Map(apps.map((app) => [app.id, app]));
    const byAppMap = new Map<
      string,
      { appId: string; name: string; prefix: string; count: number; volume: number }
    >();

    for (const app of apps) {
      byAppMap.set(app.id, {
        appId: app.id,
        name: app.name,
        prefix: app.prefix,
        count: 0,
        volume: 0,
      });
    }

    for (const txn of txns) {
      const app = appMeta.get(txn.appId);
      if (!app) continue;

      const row = byAppMap.get(txn.appId);
      if (!row) continue;

      row.count += 1;
      row.volume += txn.amount ?? 0;
    }

    return {
      totals: computeTotals(txns),
      byApp: [...byAppMap.values()].sort((a, b) => b.count - a.count),
    };
  }),

  byApp: whitelistedProcedure
    .input(z.object({ appId: z.string().min(1) }))
    .query(async ({ input }) => {
      const app = await prisma.app.findUnique({
        where: { id: input.appId },
        select: { id: true, name: true, prefix: true },
      });

      if (!app) {
        return null;
      }

      const txns = await getRecentTransactions(input.appId);

      return {
        app,
        totals: computeTotals(txns),
      };
    }),
});
