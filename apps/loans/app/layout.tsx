import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Header, Footer } from "@fintech/ui";
import "./globals.css";

export const metadata: Metadata = {
  title: "Loans — FinTech MFE",
  description: "Loan simulator with annuity calculation (micro-frontend zone).",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 antialiased"><Header /><div className="flex-1">{children}</div><Footer /></body>
    </html>
  );
}
