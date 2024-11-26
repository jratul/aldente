"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Alert from "@components/shared/Alert";
import Script from "next/script";

const queryClient = new QueryClient();

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&libraries=clusterer,drawing,services&autoload=false`}
          strategy="beforeInteractive"
        />
        {children}
        <Alert />
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default ClientProvider;
