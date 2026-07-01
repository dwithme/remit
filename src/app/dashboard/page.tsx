"use client";

import { trpc } from "@/lib/trpc/client";
import {
  TransactionAnalytics,
  TransactionAnalyticsSkeleton,
} from "@/components/dashboard/transaction-analytics";

const Page = () => {
  const { data: analytics, isLoading: analyticsLoading } =
    trpc.analytics.overview.useQuery();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Transaction activity across all apps.
        </p>
      </div>

      {analyticsLoading || !analytics ? (
        <TransactionAnalyticsSkeleton />
      ) : (
        <TransactionAnalytics
          totals={analytics.totals}
          byApp={analytics.byApp}
        />
      )}
    </div>
  );
};

export default Page;
