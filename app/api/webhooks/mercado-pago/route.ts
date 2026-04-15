import { NextResponse } from "next/server";

import { getOrderById, getOrders, updateOrder } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    data?: { id?: string };
    action?: string;
    external_reference?: string;
    orderId?: string;
    status?: string;
  };

  const orderReference = body.external_reference ?? body.orderId;
  if (!orderReference) {
    return NextResponse.json({ received: true });
  }

  const orders = await getOrders();
  const target = orders.find((entry) => entry.id === orderReference || entry.mercadoPagoReference === orderReference);

  if (!target) {
    return NextResponse.json({ received: true });
  }

  const approved = body.status === "approved" || body.action === "payment.updated" || body.orderId;
  if (approved) {
    await updateOrder(target.id, {
      paymentStatus: "pago",
      orderStatus: target.orderStatus === "pedido_recebido" ? "em_preparacao" : target.orderStatus
    });
  }

  return NextResponse.json({ received: true });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "orderId obrigatorio." }, { status: 400 });
  }

  await POST(
    new Request(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status: "approved" })
    })
  );

  return NextResponse.redirect(new URL(`/pedido/${orderId}?payment=approved`, request.url));
}
