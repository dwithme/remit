"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function draftPrefixFromName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_-]/g, "")
    .slice(0, 32);
}

export default function NewAppPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const createMutation = trpc.apps.create.useMutation({
    onSuccess: (app) => {
      utils.apps.list.invalidate();
      router.push(`/dashboard/apps/${app.id}`);
    },
  });

  const [prefixTouched, setPrefixTouched] = useState(false);
  const [form, setForm] = useState({
    name: "",
    prefix: "",
    webhookUrl: "",
  });

  const canSubmit = useMemo(() => {
    return (
      form.name.trim().length > 0 &&
      form.prefix.trim().length > 0 &&
      form.webhookUrl.trim().length > 0
    );
  }, [form]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Create app</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new app with a unique prefix and webhook URL.
          </p>
        </div>
        <Link className="text-sm underline" href="/dashboard/apps">
          Back to apps
        </Link>
      </div>

      <form
        className="grid gap-4 rounded-lg bg-card p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (!canSubmit) return;
          createMutation.mutate(form);
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => {
              const name = e.target.value;
              setForm((p) => ({
                ...p,
                name,
                prefix: prefixTouched ? p.prefix : draftPrefixFromName(name),
              }));
            }}
            placeholder="My Store"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="prefix">Prefix</Label>
          <Input
            id="prefix"
            value={form.prefix}
            onChange={(e) => {
              setPrefixTouched(true);
              setForm((p) => ({ ...p, prefix: e.target.value }));
            }}
            placeholder="store_a"
          />
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="webhookUrl">Webhook URL</Label>
          <Input
            id="webhookUrl"
            value={form.webhookUrl}
            onChange={(e) =>
              setForm((p) => ({ ...p, webhookUrl: e.target.value }))
            }
            placeholder="https://your-backend.com/webhooks/xendit"
          />
        </div>
        {createMutation.error ? (
          <p className="text-sm text-destructive">
            {createMutation.error.message}
          </p>
        ) : null}
        <div className="flex items-center justify-end gap-2 pt-4">
          <Link
            href="/dashboard/apps"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Cancel
          </Link>
          <Button type="submit" disabled={!canSubmit || createMutation.isPending}>
            {createMutation.isPending ? "Creating..." : "Create app"}
          </Button>
        </div>
      </form>
    </div>
  );
}
