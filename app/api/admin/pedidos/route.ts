import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { createOrder, getKits, getOrders, getProductById, getProducts } from "@/lib/store";
import { Customer, OrderItem, PaymentMethod, PaymentStatus } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor", "financeiro"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const body = (await request.json()) as {
    customer?: Customer;
    items?: OrderItem[];
    deliveryFeeInCents?: number;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    orderStatus?: OrderItem["kind"];
    notes?: string;
  };

  if (!body.customer || !body.items?.length) {
    return NextResponse.json({ error: "Dados do pedido incompletos." }, { status: 400 });
  }

  const products = await getProducts();
  const kits = await getKits();

  const normalizedItems = body.items.map((item) => {
    if (item.kind === "kit") {
      const kit = kits.find((entry) => entry.id === item.itemId);
      if (!kit) {
        throw new Error(`Kit nao encontrado: ${item.name}`);
      }
      return { ...item, kitItems: kit.items };
    }

    const product = products.find((entry) => entry.id === item.itemId);
    if (!product) {
      throw new Error(`Produto nao encontrado: ${item.name}`);
    }
    return { ...item, packageLabel: product.packageLabel };
  });

  await createOrder(
    {
      customer: body.customer,
      items: normalizedItems,
      deliveryFeeInCents: body.deliveryFeeInCents ?? 0,
      paymentMethod: body.paymentMethod ?? "pix",
      paymentStatus: body.paymentStatus ?? "pendente",
      orderStatus: (body.orderStatus as never) ?? "pedido_recebido",
      notes: body.notes,
      source: "manual",
      assignedUserId: actor?.id ?? null
    },
    actor?.id ?? null
  );

  return NextResponse.json({ orders: await getOrders() });
}
