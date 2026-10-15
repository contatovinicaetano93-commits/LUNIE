import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";
import { Bodoni_Moda, Geist, Geist_Mono } from "next/font/google";

import { AppShell } from "@/components/app-shell";
import { LunieMark } from "@/components/lunie-mark";
import { getWorkspace } from "@/lib/catalog";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "LUNIE",
    template: "%s · LUNIE",
  },
  description:
    "Estoque, vendas e reposição da LUNIE a partir do Hiper e da Nuvemshop.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} ${bodoni.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground">
        <Suspense fallback={<BootScreen />}>
          <Shell>{children}</Shell>
        </Suspense>
      </body>
    </html>
  );
}

async function Shell({ children }: { children: ReactNode }) {
  const workspace = await getWorkspace();
  return <AppShell workspace={workspace}>{children}</AppShell>;
}

function BootScreen() {
  return (
    <div className="px-6 py-10">
      <LunieMark />
      <p className="mt-3 text-sm text-muted-foreground">Abrindo a leitura...</p>
    </div>
  );
}
