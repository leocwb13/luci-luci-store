import { NextResponse } from "next/server";

import { ensureRoles, getCurrentUser } from "@/lib/auth";
import { createProduct, getProducts } from "@/lib/store";
import { Product } from "@/lib/types";

export async function POST(request: Request) {
  if (!(await ensureRoles(["admin", "operacao", "vendedor"]))) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const actor = await getCurrentUser();
  const body = (await request.json()) as Partial<Product>;

  const product: Product = {
    id: `prod_${body.slug ?? Date.now()}`,
    slug: body.slug ?? "",
    name: body.name ?? "",
    description: body.description ?? "",
    shortDescription: body.shortDescription ?? body.description ?? "",
    benefits: body.benefits ?? [],
    recommendedFor: body.recommendedFor ?? "",
    usage: body.usage ?? "",
    highlights: body.highlights ?? [],
    ingredients: body.ingredients ?? [],
    faq: body.faq ?? [],
    commercialPitch: body.commercialPitch,
    category: body.category ?? "vitae",
    categoryLabel: body.categoryLabel ?? "Linha Vitae",
    priceInCents: body.priceInCents ?? 0,
    packageLabel: body.packageLabel ?? "",
    badge: body.badge,
    badgeVariant: body.badgeVariant,
    accent: body.accent ?? "#7c9887",
    background: body.background ?? "linear-gradient(135deg,#edf4ee,#d9e7db)",
    imageLabel: body.name ? body.name.split(" ").slice(0, 3) : ["Novo", "Produto", "Luci"],
    imageUrl: body.imageUrl ?? "",
    stock: body.stock ?? 0,
    minStock: body.minStock ?? 3,
    notes: body.notes ?? "",
    active: body.active ?? true,
    featured: body.featured ?? false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await createProduct(product, actor?.id ?? null);
  const products = await getProducts();
  return NextResponse.json({ product, products });
}
