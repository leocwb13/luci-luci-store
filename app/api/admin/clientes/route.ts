import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { getCustomers, upsertCustomer } from "@/lib/store";
import { Customer } from "@/lib/types";

export async function GET() {
  if (!(await ensureRoles(["admin", "operacao", "vendedor", "financeiro", "familiar_viewer"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  return NextResponse.json({ customers: await getCustomers() });
}

export async function POST(request: Request) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor", "financeiro"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const body = (await request.json()) as Customer;

  if (!body.name || !body.whatsapp || !body.address) {
    return NextResponse.json({ error: "Nome, WhatsApp e endereco sao obrigatorios." }, { status: 400 });
  }

  await upsertCustomer(body, actor?.id ?? null);
  return NextResponse.json({ customers: await getCustomers() });
}
