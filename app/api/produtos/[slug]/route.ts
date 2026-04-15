import { NextResponse } from "next/server";

import { getProductBySlug } from "@/lib/store";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const product = await getProductBySlug(slug);

  if (!product || !product.active) {
    return NextResponse.json({ error: "Produto nao encontrado." }, { status: 404 });
  }

  return NextResponse.json({ product });
}
