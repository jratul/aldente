"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function withAuth(Component: React.ComponentType) {
  return function AuthComponent() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
      if (status !== "authenticated" || !session) {
        router.push("/");
      }
    }, [status, router]);

    return <Component />;
  };
}
