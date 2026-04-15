import { NextResponse } from "next/server";

import { authenticateUser, setLoginSession } from "@/lib/auth";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { email?: string; password?: string };
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const user = await authenticateUser(email, password);

  if (!user) {
    return NextResponse.json({ error: "Credenciais invalidas." }, { status: 401 });
  }

  await setLoginSession(user.id, user.role);
  return NextResponse.json({ ok: true });
}
