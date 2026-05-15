import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:3001/api";

function buildUrl(pathname: string) {
  return `${API_BASE_URL}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

export async function GET() {
  try {
    const response = await fetch(buildUrl("/pricing"), {
      method: "GET",
      cache: "no-store",
      headers: { "Content-Type": "application/json" }
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Falha ao conectar na API (pricing). Verifique se o backend está rodando.";

    return NextResponse.json(
      { success: false, error: { message } },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function PUT(request: Request) {
  const body = await request.text();

  try {
    const response = await fetch(buildUrl("/pricing"), {
      method: "PUT",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      body
    });

    const text = await response.text();

    return new NextResponse(text, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("Content-Type") ?? "application/json",
        "Cache-Control": "no-store"
      }
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Falha ao conectar na API (pricing). Verifique se o backend está rodando.";

    return NextResponse.json(
      { success: false, error: { message } },
      { status: 502, headers: { "Cache-Control": "no-store" } }
    );
  }
}
