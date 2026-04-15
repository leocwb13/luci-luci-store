import { NextResponse } from "next/server";

import { createMercadoPagoCheckout } from "@/lib/mercado-pago";
import { getOrderById, updateOrder } from "@/lib/store";

export async function POST(request: Request) {
  const body = (await request.json()) as { orderId?: string };
  if (!body.orderId) {
    return NextResponse.json({ error: "orderId obrigatorio." }, { status: 400 });
  }

  const order = await getOrderById(body.orderId);
  if (!order) {
    return NextResponse.json({ error: "Pedido nao encontrado." }, { status: 404 });
  }

  const checkout = await createMercadoPagoCheckout(order);
  await updateOrder(order.id, { mercadoPagoReference: checkout.externalReference });

  return NextResponse.json(checkout);
}
