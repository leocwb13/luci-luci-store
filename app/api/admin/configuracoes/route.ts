import { NextResponse } from "next/server";

import { ensureAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store";
import { StoreSettings } from "@/lib/types";

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  const current = await getSettings();
  const body = (await request.json()) as Partial<StoreSettings>;
  const updated: StoreSettings = {
    ...current,
    ...body
  };
  await saveSettings(updated);
  return NextResponse.json({ settings: updated });
}
