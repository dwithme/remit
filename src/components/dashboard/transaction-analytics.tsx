"use client";

import { formatIdr, type TransactionTotals } from "@/lib/transaction-analytics";
import Link from "next/link";

type AppBreakdown = {
  appId: string;
  name: string;
  prefix: string;
  count: number;
  volume: number;
};

type TransactionAnalyticsProps = {
  title?: string;
  totals: TransactionTotals;
  byApp?: AppBreakdown[];
};

const StatCard = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) => (
  <div className="rounded-lg border bg-card p-4">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
    {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
  </div>
);

export function TransactionAnalytics({
  title = "Transaction analytics",
  totals,
  byApp,
}: TransactionAnalyticsProps) {
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium">{title}</h2>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Transactions" value={String(totals.total)} hint="Last 30 days" />
        <StatCard label="Volume" value={formatIdr(totals.volume)} hint="Last 30 days" />
        <StatCard label="Successful" value={String(totals.successful)} />
        <StatCard label="Failed" value={String(totals.failed)} />
      </div>

      {byApp && byApp.length > 0 ? (
        <div className="rounded-lg border bg-card divide-y">
          {byApp.map((app) => (
              <Link
                key={app.appId}
                href={`/dashboard/apps/${app.appId}`}
                className="flex items-center justify-between gap-4 p-4 text-sm hover:bg-muted/40"
              >
                <div className="min-w-0">
                  <div className="font-medium">{app.name}</div>
                  <div className="text-xs text-muted-foreground">{app.prefix}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  <div>{app.count} txns</div>
                  <div>{formatIdr(app.volume)}</div>
                </div>
              </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function TransactionAnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-4 w-40 animate-pulse rounded bg-muted" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}
