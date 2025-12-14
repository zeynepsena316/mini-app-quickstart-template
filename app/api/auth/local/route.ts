import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body as { email?: string; password?: string };

    // Simple demo verification. Replace with real auth logic as needed.
    if (!email || !password) {
      return NextResponse.json({ message: "Email ve şifre gerekli" }, { status: 400 });
    }

    // Demo credentials
    if (email === "user@example.com" && password === "password123") {
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ message: "Geçersiz giriş bilgileri" }, { status: 401 });

  } catch (e) {
    return NextResponse.json({ message: "Geçersiz istek" }, { status: 400 });
  }
}
