import { NextResponse } from "next/server";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ success: true, data }, { ...init, headers: { "Cache-Control": "no-store", ...(init?.headers ?? {}) } });
}

export function jsonError(message: string, status = 400, code = "ERROR") {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status, headers: { "Cache-Control": "no-store" } }
  );
}

