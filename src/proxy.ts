import { auth } from "@/auth";

const publicRoutes = ["/login", "/redefinir-senha"];

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  const isAdmin = req.auth?.user?.role === "admin";

  if (req.nextUrl.pathname === "/cadastro") {
    if (!isLoggedIn) return Response.redirect(new URL("/login", req.nextUrl));
    if (!isAdmin) return Response.redirect(new URL("/", req.nextUrl));
  }

  if (!isLoggedIn && !isPublicRoute) {
    return Response.redirect(new URL("/login", req.nextUrl));
  }

  if (isLoggedIn && isPublicRoute && req.nextUrl.pathname === "/login") {
    return Response.redirect(new URL("/", req.nextUrl));
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|jpg)$).*)"],
};
