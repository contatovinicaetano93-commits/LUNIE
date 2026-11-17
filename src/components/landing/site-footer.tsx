import Link from "next/link";

import { LunieMark } from "@/components/lunie-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0c0a09] px-5 py-14 text-[var(--landing-ivory)] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <LunieMark className="h-8 w-28 bg-[var(--landing-ivory)]" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--landing-ivory)]/60">
            Moda de ocasião com corte preciso. LUNIE — presença, noite e
            silhueta.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-[11px] tracking-[0.24em] uppercase text-[var(--landing-ivory)]/70">
          <a href="#colecoes" className="hover:text-[var(--landing-ivory)]">
            Coleções
          </a>
          <a href="#looks" className="hover:text-[var(--landing-ivory)]">
            Looks
          </a>
          <Link href="/admin/login" className="hover:text-[var(--landing-ivory)]">
            Admin
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-[var(--landing-ivory)]/40">
        © 2026 LUNIE
      </p>
    </footer>
  );
}
