import { Kit, Order, Product, StoreSettings } from "@/lib/types";

export function formatCurrency(valueInCents: number | null) {
  if (valueInCents === null) {
    return "Consultar";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueInCents / 100);
}

export function getCategoryName(category: Product["category"]) {
  if (category === "vitae") return "Linha Vitae";
  if (category === "fine") return "Fine & Cosmeticos";
  return "The Men";
}

export function calculateKitAvailability(kit: Kit, products: Product[]) {
  const capacities = kit.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);
    if (!product) return 0;
    return Math.floor(product.stock / item.quantity);
  });

  return capacities.length > 0 ? Math.min(...capacities) : 0;
}

export function buildWhatsAppUrl(settings: StoreSettings, order: Order) {
  const lines = [
    `Ola! Pedido ${order.id} criado no app da ${settings.brandName}.`,
    "",
    `Cliente: ${order.customer.name}`,
    `WhatsApp: ${order.customer.whatsapp}`,
    `Entrega: ${order.customer.deliveryMethod === "delivery" ? "Entrega" : "Retirada"}`,
    `Endereco: ${order.customer.address}`,
    "",
    "Itens:"
  ];

  order.items.forEach((item) => {
    lines.push(`- ${item.quantity}x ${item.name} (${formatCurrency(item.unitPriceInCents)})`);
  });

  lines.push("");
  lines.push(`Subtotal: ${formatCurrency(order.subtotalInCents)}`);
  if (order.deliveryFeeInCents > 0) {
    lines.push(`Frete: ${formatCurrency(order.deliveryFeeInCents)}`);
  } else {
    lines.push(`Frete: Gratis`);
  }
  lines.push(`*Total: ${formatCurrency(order.totalInCents)}*`);
  lines.push(``);
  lines.push(`Pagamento: ${order.paymentMethod.replace("_", " ")}`);

  return `https://wa.me/${settings.whatsapp}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function createOrderId() {
  return `LL${Date.now().toString().slice(-8)}`;
}

export function formatInstallments(priceInCents: number | null, installments = 3): string | null {
  if (!priceInCents || priceInCents < 5000) return null; // só mostra acima de R$50
  const perInstallment = Math.ceil(priceInCents / installments);
  return `${installments}x de ${formatCurrency(perInstallment)} sem juros`;
}
