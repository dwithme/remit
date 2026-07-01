"use client";

import { trpc } from "@/lib/trpc/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const XENDIT_WEBHOOK_PATH = "/api/xendit/webhook";

const Page = () => {
  const { data: settings, isLoading } = trpc.settings.get.useQuery();
  const utils = trpc.useUtils();
  const mutation = trpc.settings.update.useMutation({
    onSuccess: () => {
      utils.settings.get.invalidate();
    },
  });

  const [form, setForm] = useState({
    xenditWebhookToken: "",
    emailWhitelist: "",
  });
  const [mainWebhookUrl, setMainWebhookUrl] = useState("");

  useEffect(() => {
    if (!settings) return;
    setForm({
      xenditWebhookToken: settings.xenditWebhookToken ?? "",
      emailWhitelist: settings.emailWhitelist ?? "",
    });
  }, [settings]);

  useEffect(() => {
    setMainWebhookUrl(`${window.location.origin}${XENDIT_WEBHOOK_PATH}`);
  }, []);

  const isSaving = mutation.isPending;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your Xendit webhook token and login email whitelist.
        </p>
      </div>

      <form
        className="space-y-4 rounded-lg bg-card p-4"
        onSubmit={handleSubmit}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="xenditToken">Xendit Webhook Token</Label>
          <Input
            id="xenditToken"
            placeholder="Secret token from Xendit callback settings"
            value={form.xenditWebhookToken}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                xenditWebhookToken: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="emailWhitelist">
            Email Whitelist for Login (comma separated)
          </Label>
          <Input
            id="emailWhitelist"
            placeholder="you@example.com, teammate@company.com"
            value={form.emailWhitelist}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                emailWhitelist: e.target.value,
              }))
            }
          />
        </div>

        <div className="grid gap-1.5">
          <Label htmlFor="appMainWebhookUrl">App Main Webhook URL</Label>
          <Input
            id="appMainWebhookUrl"
            value={mainWebhookUrl}
            readOnly
            className="bg-muted"
          />
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          <Button type="submit" disabled={isSaving || isLoading}>
            {isSaving ? "Saving..." : "Save settings"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Page;
