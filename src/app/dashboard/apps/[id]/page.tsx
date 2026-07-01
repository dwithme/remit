"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  TransactionAnalytics,
  TransactionAnalyticsSkeleton,
} from "@/components/dashboard/transaction-analytics";
import { trpc } from "@/lib/trpc/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use } from "react";
import { cn } from "@/lib/utils";

export default function AppDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: app, isLoading } = trpc.apps.get.useQuery({
    id,
    includeTransactions: true,
  });
  const { data: analytics, isLoading: analyticsLoading } =
    trpc.analytics.byApp.useQuery({ appId: id });
  const utils = trpc.useUtils();
  const deleteMutation = trpc.apps.remove.useMutation({
    onSuccess: () => {
      utils.apps.list.invalidate();
      router.push("/dashboard/apps");
    },
  });

  const handleDelete = () => {
    if (!app) return;
    const confirmed = window.confirm(
      `Delete "${app.name}"? This will remove all transaction records for this app.`,
    );
    if (!confirmed) return;
    deleteMutation.mutate({ id: app.id });
  };

  if (isLoading) {
    return (
      <div className="text-sm text-muted-foreground">Loading...</div>
    );
  }

  if (!app) {
    return (
      <div className="text-sm text-muted-foreground">
        App not found.{" "}
        <Link className="underline" href="/dashboard/apps">
          Back
        </Link>
      </div>
    );
  }

  const txns =
    "txns" in app && Array.isArray(app.txns)
      ? (app.txns as Array<{
          id: string;
          externalId: string | null;
          amount: number | null;
          status: string | null;
          createdAt: string | Date;
        }>)
      : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold tracking-tight">
            {app.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="rounded bg-muted px-2 py-0.5 text-xs">
              {app.prefix}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/apps/${app.id}/edit`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Edit
          </Link>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-card p-4 text-sm">
        <div className="text-xs text-muted-foreground">Webhook URL</div>
        <code className="mt-1 block truncate rounded bg-muted px-2 py-1 text-xs">
          {app.webhookUrl}
        </code>
      </div>

      {analyticsLoading || !analytics ? (
        <TransactionAnalyticsSkeleton />
      ) : (
        <TransactionAnalytics
          title={`${app.name} analytics`}
          totals={analytics.totals}
        />
      )}

      <div className="rounded-lg bg-card">
        <div className="p-4">
          <h2 className="text-sm font-medium">Transaction records</h2>
        </div>
        <div className="space-y-2">
          {txns.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No transactions yet.
            </div>
          ) : (
            txns.map((t) => (
              <div key={t.id} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    {t.externalId || t.id}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(t.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-muted px-2 py-0.5">
                    amount: {t.amount ?? "-"}
                  </span>
                  <span className="rounded bg-muted px-2 py-0.5">
                    status: {t.status ?? "-"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
