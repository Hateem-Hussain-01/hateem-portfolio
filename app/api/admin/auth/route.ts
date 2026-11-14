import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  AdminStorageError,
  adminStoreKind,
  isSetup,
  setupCredentials,
  signSession,
  verifyCredentials,
  verifySession,
} from "@/lib/admin";

export async function GET() {
  try {
    const setup = await isSetup();
    const jar = await cookies();
    const authed = verifySession(jar.get(SESSION_COOKIE)?.value);
    return NextResponse.json({ setup, authed, store: adminStoreKind() });
  } catch {
    // isSetup() is designed not to throw, but never let this endpoint 500.
    return NextResponse.json(
      { setup: false, authed: false, store: adminStoreKind() },
      { status: 503 },
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as {
      action?: string;
      email?: unknown;
      password?: unknown;
      confirmPassword?: unknown;
    } | null;
    const action = body?.action;

    if (action === "setup") {
      const password =
        typeof body?.password === "string" ? body.password : "";
      const confirmPassword =
        typeof body?.confirmPassword === "string" ? body.confirmPassword : "";
      const result = await setupCredentials(password, confirmPassword);
      if (!result.ok) {
        return NextResponse.json(
          { ok: false, error: result.error },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "signin") {
      const email = typeof body?.email === "string" ? body.email : "";
      const password = typeof body?.password === "string" ? body.password : "";
      const ok = await verifyCredentials(email, password);
      if (!ok) {
        // Generic on purpose: the same message for an unknown email and a wrong password.
        return NextResponse.json(
          { ok: false, error: "Email or password is incorrect." },
          { status: 401 },
        );
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
  } catch (err) {
    // Storage failures (read-only filesystem on Vercel, missing Supabase
    // table, bad API key) must never surface as an unhandled 500 — the
    // setup UI shows this message instead.
    if (err instanceof AdminStorageError) {
      return NextResponse.json({ ok: false, error: err.message }, { status: 503 });
    }
    console.error("POST /api/admin/auth failed", err);
    return NextResponse.json(
      {
        ok: false,
        error:
          "Could not save admin credentials — storage unavailable. Check the Supabase tables / env vars and retry setup.",
      },
      { status: 503 },
    );
  }
}
