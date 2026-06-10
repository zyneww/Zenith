import { createSerwistRoute } from "@serwist/turbopack";

const serwistRoute = createSerwistRoute({
  swSrc: "app/sw.ts",
  globDirectory: "public",
  additionalPrecacheEntries: [
    { url: "/offline", revision: crypto.randomUUID() },
  ],
});

export const GET = serwistRoute.GET;
export const dynamic = "force-static";
export const dynamicParams = false;
export const revalidate = false;
export const generateStaticParams = serwistRoute.generateStaticParams;
