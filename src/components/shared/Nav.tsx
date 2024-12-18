"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function Nav() {
  const { data: session, status } = useSession();

  const userInfo = () => {
    switch (status) {
      case "authenticated":
        return (
          session && (
            <div className="flex items-center gap-2 text-sm md:text-base">
              <Image
                width={400}
                height={400}
                alt="userImage"
                src={session?.user?.image ?? ""}
                className="w-10 aspect-square rounded-full"
                priority
              />
              <Link href="/write" className="hover:underline">
                리뷰쓰기
              </Link>
              <button
                className="hover:underline"
                onClick={() => {
                  signOut({
                    callbackUrl: "/",
                  });
                }}
              >
                로그아웃
              </button>
            </div>
          )
        );
      case "unauthenticated":
        return (
          <button
            className="hover:underline text-sm md:text-base"
            onClick={() =>
              signIn("google", {
                callbackUrl: "/",
              })
            }
          >
            로그인
          </button>
        );
      default:
        return null;
    }
  };
  return (
    <div className="sticky top-0 z-10 flex h-[50px] items-center justify-start gap-4 bg-white min-w-2xl p-4">
      <div className="grow">
        <Link href="/" className="text-xl font-bold text-blue-500 font-aldrich">
          Aldente
        </Link>
      </div>
      {userInfo()}
    </div>
  );
}
