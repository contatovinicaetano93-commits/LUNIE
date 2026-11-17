"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LunieMark } from "@/components/lunie-mark";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "#colecoes", label: "Coleções" },
  { href: "#looks", label: "Looks" },
  { href: "#convite", label: "Convite" },
] as const;

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
          ? "border-b border-white/10 bg-[#0c0a09]/85 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:h-20 sm:px-8">
        <Link href="/" aria-label="LUNIE início" className="landing-fade-in">
          <LunieMark className="h-8 w-28 bg-[var(--landing-ivory)] sm:h-10 sm:w-36" />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-[11px] tracking-[0.28em] text-[var(--landing-ivory)]/80 uppercase transition-colors hover:text-[var(--landing-ivory)]"
            >
              {item.label}
            </a>
          ))}
        </nav>
        <a
          href="#colecoes"
          className="text-[11px] tracking-[0.28em] text-[var(--landing-ivory)] uppercase underline-offset-4 transition hover:underline"
        >
          Comprar
        </a>
      </div>
    </header>
  );
}
