import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ClientProvider from "context/ClientProvider";
import Nav from "@components/Nav";
import Container from "@components/Container";
import Script from "next/script";

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
      <head>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_APP_KEY}&libraries=clusterer,drawing,services&autoload=false`}
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={
          "font-pretendard tracking-tight min-w-[380px] max-w-3xl mx-auto"
        }
      >
        <ClientProvider>
          <Nav />
          <Container>{children}</Container>
        </ClientProvider>
      </body>
    </html>
  );
}
