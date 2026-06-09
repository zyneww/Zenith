import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import createMiddleware from "next-intl/middleware";
import { routing, isRTL } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export function getDirection(locale: string): "ltr" | "rtl" {
  return isRTL(locale) ? "rtl" : "ltr";
}

const isPublicRoute = createRouteMatcher([
  "/",
  "/:locale",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/:locale/sign-in(.*)",
  "/:locale/sign-up(.*)",
  "/markets(.*)",
  "/:locale/markets(.*)",
  "/resources(.*)",
  "/:locale/resources(.*)",
  "/help(.*)",
  "/:locale/help(.*)",
  "/legal(.*)",
  "/:locale/legal(.*)",
  "/api(.*)",
]);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
  return intlMiddleware(request);
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
