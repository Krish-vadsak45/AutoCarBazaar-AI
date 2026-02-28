import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  console.log("jkj", pathname);
  // Get session token from NextAuth
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/vendor/login");

  const isProtectedRoute =
    pathname.startsWith("/aboutus") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/vendor");

  // ✅ If NOT logged in & trying to access protected route → redirect to sign-in
  if (!token && isProtectedRoute && !isAuthPage) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }

  // ✅ Role-based access control
  if (token) {
    const userRole = token.role;
    const vendorId = (token as any).vendorId;

    // Handle Admin routes
    if (pathname.startsWith("/admin")) {
      if (pathname === "/admin/login") {
        if (userRole === "admin") {
          return NextResponse.redirect(
            new URL(`/admin/${token._id}/dashboard`, req.url),
          );
        }
        // If they are a vendor, they should go to their specific vendor dashboard
        if (userRole === "vendor" && vendorId) {
          return NextResponse.redirect(
            new URL(`/vendor/${vendorId}/dashboard`, req.url),
          );
        }
      } else {
        // Protected Admin routes: /admin/[vendorId]/...
        if (userRole !== "admin" && userRole !== "vendor") {
          // If a regular user tries to access admin routes, send them to profile
          if (userRole === "user") {
            return NextResponse.redirect(new URL("/profile", req.url));
          }
          return NextResponse.redirect(new URL("/", req.url));
        }

        if (userRole === "vendor") {
          const segments = pathname.split("/");
          const pathVendorId = segments[2];
          if (pathVendorId && pathVendorId !== vendorId) {
            return NextResponse.redirect(
              new URL(`/vendor/${vendorId}/dashboard`, req.url),
            );
          }
        }
      }
    }

    // Handle Vendor routes (if they still exist)
    if (pathname.startsWith("/vendor")) {
      // 1. Allow access to login page without checks
      if (pathname === "/vendor/login") {
        return NextResponse.next();
      }

      // 2. Check Role: Must be 'vendor'
      if (userRole !== "vendor") {
        // If a regular user tries to access vendor routes, send them to profile
        if (userRole === "user") {
          return NextResponse.redirect(new URL("/profile", req.url));
        }
        return NextResponse.redirect(new URL("/", req.url));
      }

      // 3. Check Vendor ID match
      const segments = pathname.split("/");
      const pathVendorId = segments[2]; // /vendor/[vendorId]/...

      if (vendorId && pathVendorId && pathVendorId !== vendorId) {
        return NextResponse.redirect(
          new URL(`/vendor/${vendorId}/dashboard`, req.url),
        );
      }
    }
  }

  // ✅ If logged in & trying to access sign-in/sign-up → redirect
  if (token && (pathname === "/sign-in" || pathname === "/sign-up")) {
    const userRole = token.role;
    if (userRole === "admin") {
      // Where do admins go? The user said /admin/[vendor_id]/dashboard.
      // If admin doesn't have a vendorId, what happens?
      // For now, let's assume admin uses their own ID or we need to find a way.
      return NextResponse.redirect(
        new URL(`/admin/${token._id}/dashboard`, req.url),
      );
    } else if (userRole === "vendor" && (token as any).vendorId) {
      return NextResponse.redirect(
        new URL(`/vendor/${(token as any).vendorId}/dashboard`, req.url),
      );
    } else if (userRole === "user") {
      // Redirect regular users to profile or home
      return NextResponse.redirect(new URL("/profile", req.url));
    }
    return NextResponse.redirect(new URL("/", req.url));
  }

  // ✅ Otherwise allow request
  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: [
    "/profile/:path*",
    "/admin/:path*",
    "/vendor/:path*",
    "/sign-in",
    "/sign-up",
  ],
};
