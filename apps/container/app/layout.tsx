import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { SessionProvider } from "./session";
import { AppTopBar } from "./app-top-bar";

export const metadata: Metadata = {
  title: "QUPI — Dompet Digital",
  description: "QUPI: top up, transfer, QRIS, tagihan, paylater — mobile-first.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id" className="h-full">
      <body className="min-h-full bg-qpi-bg text-qpi-text antialiased">
        <SessionProvider>
          <AppTopBar />
          <div className="flex-1">{children}</div>
        </SessionProvider>
      </body>
    </html>
  );
}
