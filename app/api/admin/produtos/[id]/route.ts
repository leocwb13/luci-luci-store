import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { deleteProduct, getProducts, updateProduct } from "@/lib/store";
import { Product } from "@/lib/types";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Product>;
  await updateProduct(
    id,
    {
      ...body,
      imageLabel: body.name ? body.name.split(" ").slice(0, 3) : body.imageLabel
    },
    actor?.id ?? null
  );
  return NextResponse.json({ products: await getProducts() });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureRoles(["admin", "operacao"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const { id } = await context.params;
  await deleteProduct(id, actor?.id ?? null);
  return NextResponse.json({ products: await getProducts() });
}
