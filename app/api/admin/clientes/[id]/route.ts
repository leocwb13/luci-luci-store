import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { getCustomers, updateCustomer } from "@/lib/store";
import { Customer } from "@/lib/types";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor", "financeiro"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Customer>;
  await updateCustomer(id, body, actor?.id ?? null);
  return NextResponse.json({ customers: await getCustomers() });
}
