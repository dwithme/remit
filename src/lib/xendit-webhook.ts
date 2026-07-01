type AppMatch = {
  id: string;
  prefix: string;
  webhookUrl: string;
};

export const extractExternalId = (payload: unknown): string | undefined => {
  if (!payload || typeof payload !== "object") return undefined;

  const root = payload as Record<string, unknown>;
  if (typeof root.external_id === "string" && root.external_id.length > 0) {
    return root.external_id;
  }

  const data = root.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    if (typeof nested.external_id === "string" && nested.external_id.length > 0) {
      return nested.external_id;
    }
  }

  return undefined;
};

export const extractAmount = (payload: unknown): number | undefined => {
  if (!payload || typeof payload !== "object") return undefined;

  const root = payload as Record<string, unknown>;
  const candidates = [
    root.amount,
    root.paid_amount,
    root.requested_amount,
    root.data && typeof root.data === "object"
      ? (root.data as Record<string, unknown>).amount
      : undefined,
  ];

  for (const value of candidates) {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
};

export const extractStatus = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "webhook";

  const root = payload as Record<string, unknown>;
  if (typeof root.status === "string" && root.status.length > 0) {
    return root.status;
  }
  if (typeof root.event === "string" && root.event.length > 0) {
    return root.event;
  }

  const data = root.data;
  if (data && typeof data === "object") {
    const nested = data as Record<string, unknown>;
    if (typeof nested.status === "string" && nested.status.length > 0) {
      return nested.status;
    }
  }

  return "webhook";
};

export const findAppByExternalId = (
  apps: AppMatch[],
  externalId: string,
): AppMatch | undefined => {
  const lower = externalId.toLowerCase();

  return apps
    .filter((app) => {
      const prefix = app.prefix.toLowerCase();
      return (
        lower === prefix ||
        lower.startsWith(`${prefix}_`) ||
        lower.startsWith(`${prefix}-`) ||
        lower.startsWith(`${prefix}/`)
      );
    })
    .sort((a, b) => b.prefix.length - a.prefix.length)[0];
};
