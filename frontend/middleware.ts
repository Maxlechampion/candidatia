import createMiddleware from "next-intl/middleware";
import { locales, localePrefix } from "./navigation";

export default createMiddleware({
  locales,
  localePrefix,
  defaultLocale: "fr",
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};