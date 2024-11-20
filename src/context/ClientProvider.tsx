"use client";

import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Alert from "@components/Alert";

const queryClient = new QueryClient();

const ClientProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        <Alert />
      </QueryClientProvider>
    </SessionProvider>
  );
};

export default ClientProvider;
