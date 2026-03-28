declare global {
  interface Window {
    kakao: any;
  }
}

// next-auth v4 compatibility shim for Next.js 16
declare module "next/server.js" {
  export * from "next/server";
}

export {};
