import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ prefix: string }> },
) {
  const { prefix } = await params;
  const app = await prisma.app.findUnique({ where: { prefix } });
  if (!app) {
    return NextResponse.json({ error: "App not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const externalId =
    typeof body.externalId === "string" ? body.externalId : undefined;
  const amount = typeof body.amount === "number" ? body.amount : undefined;

  const txn = await prisma.transaction.create({
    data: {
      appId: app.id,
      externalId,
      amount,
      status: "created",
      payloadJson: body ?? null,
    },
    select: { id: true, externalId: true, amount: true, status: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    app: { id: app.id, prefix: app.prefix },
    transaction: txn,
    next: {
      webhookUrl: app.webhookUrl,
    },
  });
}

