type TxnRow = {
  amount: number | null;
  status: string | null;
  createdAt: Date;
};

export type TransactionTotals = {
  total: number;
  volume: number;
  successful: number;
  failed: number;
  pending: number;
};

const successStatuses = new Set(["PAID", "SUCCEEDED", "SETTLED", "COMPLETED"]);

export const classifyStatus = (status: string | null | undefined) => {
  if (!status) return "pending" as const;

  const normalized = status.trim().toUpperCase();
  if (successStatuses.has(normalized) || normalized.includes("PAID")) {
    return "successful" as const;
  }
  if (
    normalized.startsWith("FORWARD_FAILED") ||
    normalized === "FAILED" ||
    normalized === "EXPIRED" ||
    normalized === "CANCELLED" ||
    normalized === "VOIDED"
  ) {
    return "failed" as const;
  }

  return "pending" as const;
};

export const computeTotals = (txns: TxnRow[]): TransactionTotals => {
  const totals: TransactionTotals = {
    total: txns.length,
    volume: 0,
    successful: 0,
    failed: 0,
    pending: 0,
  };

  for (const txn of txns) {
    totals.volume += txn.amount ?? 0;
    totals[classifyStatus(txn.status)] += 1;
  }

  return totals;
};

export const formatIdr = (amount: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
