"use client";

import { trpc } from "@/lib/trpc/client";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AppsPage() {
  const { data: apps, isLoading } = trpc.apps.list.useQuery();
  const utils = trpc.useUtils();
  const deleteMutation = trpc.apps.remove.useMutation({
    onSuccess: () => utils.apps.list.invalidate(),
  });

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(
      `Delete "${name}"? This will remove all transaction records for this app.`,
    );
    if (!confirmed) return;
    deleteMutation.mutate({ id });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Apps</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage apps with unique prefixes and webhook URLs.
          </p>
        </div>
        <Link href="/dashboard/apps/new" className={cn(buttonVariants())}>
          Create app
        </Link>
      </div>

      <div className="rounded-lg bg-card">
        <div className="space-y-2">
          {isLoading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : (apps?.length ?? 0) === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No apps yet.{" "}
              <Link className="underline" href="/dashboard/apps/new">
                Create one
              </Link>
              .
            </div>
          ) : (
            apps!.map((app) => (
              <div
                key={app.id}
                className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/apps/${app.id}`}
                      className="truncate text-sm font-medium underline"
                    >
                      {app.name}
                    </Link>
                    <span className="rounded bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                      {app.prefix}
                    </span>
                  </div>
                  <div className="mt-1 truncate text-xs text-muted-foreground">
                    Webhook URL:{" "}
                    <code className="rounded bg-muted px-1 py-0.5 text-[11px]">
                      {app.webhookUrl}
                    </code>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/dashboard/apps/${app.id}/edit`}
                    className={cn(buttonVariants({ variant: "outline" }))}
                  >
                    Edit
                  </Link>
                  <Button
                    variant="destructive"
                    onClick={() => handleDelete(app.id, app.name)}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
