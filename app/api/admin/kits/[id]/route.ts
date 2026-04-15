import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { deleteKit, getKits, getProducts, updateKit } from "@/lib/store";
import { Kit } from "@/lib/types";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor"]))) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  const actor = await getCurrentUser();
  const { id } = await context.params;
  const body = (await request.json()) as Partial<Kit>;
  const products = await getProducts();
  const compareAtInCents = (body.items ?? []).reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.priceInCents ?? 0) * item.quantity;
  }, body.compareAtInCents ?? 0);
  const priceInCents = body.priceInCents ?? 0;
  await updateKit(
    id,
    {
      ...body,
      compareAtInCents,
      savingsInCents: Math.max(compareAtInCents - priceInCents, 0),
      savingsPercent: compareAtInCents > 0 ? Math.round((Math.max(compareAtInCents - priceInCents, 0) / compareAtInCents) * 100) : 0
    },
    actor?.id ?? null
  );
  return NextResponse.json({ kits: await getKits() });
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await ensureRoles(["admin", "operacao"]))) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  const actor = await getCurrentUser();
  const { id } = await context.params;
  await deleteKit(id, actor?.id ?? null);
  return NextResponse.json({ kits: await getKits() });
}
