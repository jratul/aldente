"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  const userInfo = () => {
    switch (status) {
      case "loading":
        return null;
      case "authenticated":
        return (
          session && (
            <>
              <Image
                width={400}
                height={400}
                alt="userImage"
                src={session?.user?.image ?? ""}
                className="w-10 aspect-square rounded-full"
                priority
              />
              {session.user?.email}
              <br />
              {session.user?.name}
              <br />
              <button
                onClick={() => {
                  signOut({
                    callbackUrl: "/",
                  });
                }}
              >
                로그아웃
              </button>
            </>
          )
        );
      default:
        return (
          <button
            onClick={() =>
              signIn("google", {
                callbackUrl: "/",
              })
            }
          >
            로그인
          </button>
        );
    }
  };

  return (
    <div>
      <div>Aldente</div>
      status: {status}
      <br />
      {userInfo()}
    </div>
  );
}
