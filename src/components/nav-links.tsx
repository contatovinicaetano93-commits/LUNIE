"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Visão" },
  { href: "/estoque", label: "Estoque" },
  { href: "/movimentos", label: "Movimentos" },
  { href: "/mais-vendidos", label: "Mais vendidos" },
  { href: "/reposicao", label: "Reposição" },
  { href: "/insights", label: "Insights" },
] as const;

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="-mx-1 flex gap-1 overflow-x-auto pb-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "shrink-0 rounded-full px-3 py-1.5 text-sm font-medium",
              active
                ? "bg-primary text-primary-foreground"
                : "text-foreground/80 hover:bg-muted hover:text-foreground",
            )}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
