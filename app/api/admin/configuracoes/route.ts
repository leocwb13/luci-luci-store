import { NextResponse } from "next/server";

import { ensureAdmin } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store";
import { StoreSettings } from "@/lib/types";

export async function GET() {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = (await getSettings()) as any;
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await ensureAdmin())) {
    return NextResponse.json({ error: "Nao autorizado." }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const current = (await getSettings()) as any;
  const body = (await request.json()) as Partial<StoreSettings>;
  const updated: StoreSettings = {
    ...current,
    ...body,
    freeShippingThresholdInCents: body.freeShippingThresholdInCents ?? current.freeShippingThresholdInCents ?? 0
  };
  await saveSettings(updated);
  return NextResponse.json({ settings: updated });
}