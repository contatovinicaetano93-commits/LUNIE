import type { Metadata } from "next";
import { Bodoni_Moda, Cormorant_Garamond, Manrope } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const bodoni = Bodoni_Moda({
  variable: "--font-bodoni",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const maxDuration = 60;

export const metadata: Metadata = {
  title: {
    default: "LUNIE",
    template: "%s · LUNIE",
  },
  description:
    "LUNIE — moda para ocasiões. Peças com presença, corte preciso e atitude.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${manrope.variable} ${cormorant.variable} ${bodoni.variable} h-full`}
    >
      <body className="min-h-full bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
