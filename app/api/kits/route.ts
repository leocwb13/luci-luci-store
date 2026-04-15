import { NextResponse } from "next/server";

import { getActiveKits } from "@/lib/store";

export async function GET() {
  const kits = await getActiveKits();
  return NextResponse.json({ kits });
}
