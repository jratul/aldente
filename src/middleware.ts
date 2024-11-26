import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = ["/write", "/api/write"];

export async function middleware(req: NextRequest) {
  if (protectedRoutes.some(path => req.nextUrl.pathname.startsWith(path))) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      if (req.headers.get("accept")?.includes("text/html")) {
        return NextResponse.redirect(new URL("/", req.url));
      }

      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/write", "/api/write"],
};
