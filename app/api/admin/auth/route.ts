import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  isSetup,
  setupPin,
  signSession,
  verifyPin,
  verifySession,
} from "@/lib/admin";


export async function GET() {
  const jar = await cookies();
  const setup = await isSetup();
  const authed = verifySession(jar.get(SESSION_COOKIE)?.value);
  return NextResponse.json({ setup, authed });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    action?: string;
    pin?: unknown;
  } | null;
  const action = body?.action;

  if (action === "setup") {
    const pin = typeof body?.pin === "string" ? body.pin : "";
    const result = await setupPin(pin);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  }

  if (action === "signin") {
    const pin = typeof body?.pin === "string" ? body.pin : "";
    const ok = await verifyPin(pin);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "Wrong PIN." }, { status: 401 });
    }
    const jar = await cookies();
    jar.set(SESSION_COOKIE, signSession(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      secure: process.env.NODE_ENV === "production",
    });
    return NextResponse.json({ ok: true });
  }

  if (action === "signout") {
    const jar = await cookies();
    jar.delete(SESSION_COOKIE);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: false, error: "Unknown action." }, { status: 400 });
}
