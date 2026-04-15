import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { createKit, getKits, getProducts } from "@/lib/store";
import { Kit } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor"]))) return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  const actor = await getCurrentUser();
  const body = (await request.json()) as Partial<Kit>;
  const products = await getProducts();
  const compareAtInCents = (body.items ?? []).reduce((total, item) => {
    const product = products.find((entry) => entry.id === item.productId);
    return total + (product?.priceInCents ?? 0) * item.quantity;
  }, 0);
  const savingsInCents = Math.max(compareAtInCents - (body.priceInCents ?? 0), 0);
  const kit: Kit = {
    id: `kit_${body.slug ?? Date.now()}`,
    slug: body.slug ?? "",
    name: body.name ?? "",
    shortDescription: body.shortDescription ?? "",
    description: body.description ?? "",
    categoryLabel: body.categoryLabel ?? "Kits",
    priceInCents: body.priceInCents ?? 0,
    compareAtInCents,
    savingsInCents,
    savingsPercent: compareAtInCents > 0 ? Math.round((savingsInCents / compareAtInCents) * 100) : 0,
    targetAudience: body.targetAudience ?? "",
    salesTip: body.salesTip ?? "",
    ctaText: body.ctaText ?? "",
    accent: body.accent ?? "#7c9887",
    background: body.background ?? "linear-gradient(135deg,#edf4ee,#d9e7db)",
    imageLabel: body.imageLabel ?? ["Kit", "Luci", "Luci"],
    imageUrl: body.imageUrl ?? "",
    notes: body.notes ?? "",
    featured: body.featured ?? false,
    active: body.active ?? true,
    items: body.items ?? [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  await createKit(kit, actor?.id ?? null);
  return NextResponse.json({ kits: await getKits(), kit });
}
