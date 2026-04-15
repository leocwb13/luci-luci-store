import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { createFinanceEntry, getFinanceEntries, getFinanceSummary } from "@/lib/store";
import { FinanceEntry } from "@/lib/types";

export async function GET() {
  if (!(await ensureRoles(["admin", "financeiro"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const [entries, summary] = await Promise.all([getFinanceEntries(), getFinanceSummary()]);
  return NextResponse.json({ entries, summary });
}

export async function POST(request: Request) {
  if (!(await ensureRoles(["admin", "financeiro"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const body = (await request.json()) as Partial<FinanceEntry>;
  if (!body.description || !body.kind || !body.category || typeof body.amountInCents !== "number") {
    return NextResponse.json({ error: "Descricao, tipo, categoria e valor sao obrigatorios." }, { status: 400 });
  }

  await createFinanceEntry(
    {
      id: randomUUID(),
      kind: body.kind,
      category: body.category,
      description: body.description,
      amountInCents: body.amountInCents,
      status: body.status ?? "pending",
      dueDate: body.dueDate ?? null,
      paidAt: body.status === "paid" ? body.paidAt ?? new Date().toISOString() : null,
      relatedOrderId: body.relatedOrderId ?? null,
      notes: body.notes ?? "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdByUserId: actor?.id ?? null
    },
    actor?.id ?? null
  );

  const [entries, summary] = await Promise.all([getFinanceEntries(), getFinanceSummary()]);
  return NextResponse.json({ entries, summary });
}
