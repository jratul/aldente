// Compatibility shims for Next.js 16 internal module paths
// TypeScript with 'bundler'/'node16' moduleResolution can't resolve .js -> .d.ts for these paths
declare module "next/server.js" {
  export { NextFetchEvent } from "next/dist/server/web/spec-extension/fetch-event";
  export { NextRequest } from "next/dist/server/web/spec-extension/request";
  export { NextResponse } from "next/dist/server/web/spec-extension/response";
  export {
    userAgentFromString,
    userAgent,
  } from "next/dist/server/web/spec-extension/user-agent";
  export { ImageResponse } from "next/dist/server/web/spec-extension/image-response";
}

declare module "next/dist/build/segment-config/app/app-segment-config.js" {
  export * from "next/dist/build/segment-config/app/app-segment-config";
}
