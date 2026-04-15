import { NextResponse } from "next/server";

import { getKitBySlug } from "@/lib/store";

export async function GET(_: Request, context: { params: Promise<{ slug: string }> }) {
  const { slug } = await context.params;
  const kit = await getKitBySlug(slug);
  if (!kit || !kit.active) {
    return NextResponse.json({ error: "Kit nao encontrado." }, { status: 404 });
  }
  return NextResponse.json({ kit });
}
