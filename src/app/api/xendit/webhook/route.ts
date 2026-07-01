import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  extractAmount,
  extractExternalId,
  extractStatus,
  findAppByExternalId,
} from "@/lib/xendit-webhook";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const settings = await getSettings();

  const providedToken =
    req.headers.get("x-callback-token") ?? req.headers.get("xendit-token");
  if (
    settings.xenditWebhookToken &&
    providedToken !== settings.xenditWebhookToken
  ) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const payload = await req.json().catch(() => ({}));
  const externalId = extractExternalId(payload);

  if (!externalId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing external_id in webhook payload",
      },
      { status: 422 },
    );
  }

  const apps = await prisma.app.findMany({
    select: { id: true, prefix: true, webhookUrl: true },
  });
  const app = findAppByExternalId(apps, externalId);

  if (!app) {
    return NextResponse.json(
      {
        ok: false,
        assigned: false,
        error: `No app matched external_id: ${externalId}`,
      },
      { status: 404 },
    );
  }

  let forwardOk = false;
  let forwardStatus = 0;

  try {
    const forwardRes = await fetch(app.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(providedToken ? { "x-callback-token": providedToken } : {}),
      },
      body: JSON.stringify(payload),
    });
    forwardOk = forwardRes.ok;
    forwardStatus = forwardRes.status;
  } catch {
    forwardOk = false;
  }

  const status = forwardOk
    ? extractStatus(payload)
    : `forward_failed_${forwardStatus || "error"}`;

  const txn = await prisma.transaction.create({
    data: {
      appId: app.id,
      externalId,
      amount: extractAmount(payload),
      status,
      payloadJson: payload ?? null,
    },
    select: { id: true, status: true },
  });

  return NextResponse.json({
    ok: forwardOk,
    assigned: true,
    app: { id: app.id, prefix: app.prefix },
    forwardedTo: app.webhookUrl,
    forwardStatus: forwardStatus || null,
    transaction: txn,
  });
}
