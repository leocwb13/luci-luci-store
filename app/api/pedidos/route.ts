import { NextResponse } from "next/server";

import { createMercadoPagoCheckout } from "@/lib/mercado-pago";
import { createOrder, getKitById, getProductById, updateOrder } from "@/lib/store";
import { CartItem, Customer, OrderItem, PaymentMethod } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    customer?: Customer;
    items?: CartItem[];
    deliveryFeeInCents?: number;
    paymentMethod?: PaymentMethod;
  };

  if (!body.customer || !body.items?.length) {
    return NextResponse.json({ error: "Dados do pedido incompletos." }, { status: 400 });
  }

  const normalizedItems: OrderItem[] = [];

  for (const item of body.items) {
    if (item.kind === "product") {
      const product = await getProductById(item.itemId);
      if (!product || !product.active || product.stock < item.quantity || product.priceInCents === null) {
        return NextResponse.json({ error: `Produto indisponivel: ${item.name}.` }, { status: 400 });
      }

      normalizedItems.push({
        kind: "product",
        itemId: product.id,
        slug: product.slug,
        name: product.name,
        quantity: item.quantity,
        unitPriceInCents: product.priceInCents,
        categoryLabel: product.categoryLabel
      });
      continue;
    }

    const kit = await getKitById(item.itemId);
    if (!kit || !kit.active) {
      return NextResponse.json({ error: `Kit indisponivel: ${item.name}.` }, { status: 400 });
    }

    normalizedItems.push({
      kind: "kit",
      itemId: kit.id,
      slug: kit.slug,
      name: kit.name,
      quantity: item.quantity,
      unitPriceInCents: kit.priceInCents,
      categoryLabel: kit.categoryLabel,
      kitItems: kit.items
    });
  }

  const order = await createOrder({
    customer: body.customer,
    items: normalizedItems,
    deliveryFeeInCents: body.deliveryFeeInCents ?? 0,
    paymentMethod: body.paymentMethod ?? "mercado_pago",
    paymentStatus: body.paymentMethod === "dinheiro" ? "pendente" : "pendente",
    orderStatus: "pedido_recebido",
    source: "site"
  });

  if (order.paymentMethod !== "mercado_pago") {
    return NextResponse.json({ orderId: order.id, checkoutUrl: `/pedido/${order.id}` });
  }

  const paymentData = await createMercadoPagoCheckout(order);
  await updateOrder(order.id, { mercadoPagoReference: paymentData.externalReference });
  return NextResponse.json({ orderId: order.id, checkoutUrl: paymentData.checkoutUrl ?? `/pedido/${order.id}` });
}
