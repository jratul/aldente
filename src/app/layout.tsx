import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import ClientProvider from "./context/ClientProvider";

export const metadata: Metadata = {
  title: "Aldente",
  description: "미식의 경험을 나눠 보세요",
};

const pretendard = localFont({
  src: "./fonts/PretendardVariable.woff2",
  display: "swap",
  weight: "45 920",
  variable: "--font-pretendard",
});

const aldrich = localFont({
  src: "./fonts/Aldrich-Regular.ttf",
  display: "swap",
  variable: "--font-aldrich",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} ${aldrich.variable}`}>
      <body className={"font-pretendard tracking-tight max-w-3xl mx-auto"}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
