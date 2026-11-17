"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LunieMark } from "@/components/lunie-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#destaques", label: "Destaques" },
  { href: "#colecoes", label: "Coleções" },
  { href: "#novidades", label: "Lançamentos" },
] as const;

const SHOP_URL = "https://www.lunieshop.com.br/produtos/";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,backdrop-filter,border-color] duration-500",
        scrolled
          ? "border-b border-[var(--landing-clay)]/60 bg-[var(--landing-sand)]/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
        <Link href="/" aria-label="LUNIE início" className="landing-fade-in">
          <LunieMark className="h-8 w-28 bg-[var(--landing-espresso)] sm:h-10 sm:w-36" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] tracking-[0.28em] text-[var(--landing-espresso)]/75 uppercase transition-colors hover:text-[var(--landing-espresso)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href={SHOP_URL}
          target="_blank"
          rel="noreferrer"
          className="text-[11px] tracking-[0.28em] text-[var(--landing-espresso)] uppercase underline-offset-4 transition hover:underline"
        >
          Loja
        </a>
      </div>
    </header>
  );
}
