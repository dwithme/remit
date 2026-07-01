"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";

export default function EditAppPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: app, isLoading } = trpc.apps.get.useQuery({ id });
  const utils = trpc.useUtils();
  const updateMutation = trpc.apps.update.useMutation({
    onSuccess: () => {
      utils.apps.get.invalidate({ id });
      utils.apps.list.invalidate();
      router.push(`/dashboard/apps/${id}`);
    },
  });

  const [form, setForm] = useState({
    name: "",
    prefix: "",
    webhookUrl: "",
  });

  useEffect(() => {
    if (!app) return;
    setForm({
      name: app.name,
      prefix: app.prefix,
      webhookUrl: app.webhookUrl,
    });
  }, [app]);

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
          Back to apps
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit app</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update settings for {app.name}.
          </p>
        </div>
        <Link className="text-sm underline" href={`/dashboard/apps/${id}`}>
          Back to app
        </Link>
      </div>

      <form
        className="grid gap-4 rounded-lg bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          updateMutation.mutate({
            id: app.id,
            name: form.name,
            prefix: form.prefix,
            webhookUrl: form.webhookUrl,
          });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="prefix">Prefix</Label>
          <Input
            id="prefix"
            value={form.prefix}
            onChange={(e) =>
              setForm((p) => ({ ...p, prefix: e.target.value }))
            }
          />
          {updateMutation.error ? (
            <p className="text-sm text-destructive">
              {updateMutation.error.message}
            </p>
          ) : null}
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={form.webhookUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, webhookUrl: e.target.value }))
            }
          />
        </div>
        <div className="flex items-center justify-end gap-2 pt-4">
          <Link
            href={`/dashboard/apps/${id}`}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
