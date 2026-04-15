import { Order } from "@/lib/types";

export async function createMercadoPagoCheckout(order: Order) {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  if (!token) {
    return {
      checkoutUrl: `${appUrl}/api/webhooks/mercado-pago?orderId=${order.id}`,
      externalReference: `mock_${order.id}`,
      mocked: true
    };
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      external_reference: order.id,
      notification_url: `${appUrl}/api/webhooks/mercado-pago`,
      back_urls: {
        success: `${appUrl}/pedido/${order.id}?payment=success`,
        failure: `${appUrl}/pedido/${order.id}?payment=failure`,
        pending: `${appUrl}/pedido/${order.id}?payment=pending`
      },
      auto_return: "approved",
      items: order.items.map((item) => ({
        id: item.itemId,
        title: item.name,
        quantity: item.quantity,
        currency_id: "BRL",
        unit_price: item.unitPriceInCents / 100
      }))
    })
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel criar a preferencia de pagamento no Mercado Pago.");
  }

  const data = (await response.json()) as {
    init_point: string;
    id: string;
  };

  return {
    checkoutUrl: data.init_point,
    externalReference: data.id,
    mocked: false
  };
}
