import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Get session token from NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage =
    pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  const isProtectedRoute =
    pathname.startsWith("/aboutus") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin");

  // ✅ If NOT logged in & trying to access protected route → redirect to sign-in
  if (!token && isProtectedRoute) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }

  // ✅ If logged in & trying to access sign-in/sign-up → redirect to dashboard
  if (token && isAuthPage) {
    const url = new URL("/", req.url);
    return NextResponse.redirect(url);
  }

  // ✅ Otherwise allow request
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/profile/:path*", "/admin/:path*", "/sign-in", "/sign-up"],
};
