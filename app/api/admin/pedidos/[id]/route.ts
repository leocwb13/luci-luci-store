import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { getOrders, updateOrder } from "@/lib/store";
import { OrderStatus, PaymentStatus } from "@/lib/types";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor", "financeiro"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const { id } = await context.params;
  const body = (await request.json()) as {
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderStatus;
  };
  await updateOrder(id, body, actor?.id ?? null);
  return NextResponse.json({ orders: await getOrders() });
}
