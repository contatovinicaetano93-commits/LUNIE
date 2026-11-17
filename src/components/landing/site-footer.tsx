import Link from "next/link";

import { LunieMark } from "@/components/lunie-mark";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--landing-clay)] bg-[var(--landing-espresso)] px-5 py-14 text-[var(--landing-sand)] sm:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <LunieMark className="h-8 w-28 bg-[var(--landing-sand)]" />
          <p className="mt-4 max-w-sm text-sm leading-7 text-[var(--landing-sand)]/70">
            Moda artesanal e de ocasião. Vestidos, handmade e conjuntos —
            LUNIE.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-[11px] tracking-[0.24em] uppercase text-[var(--landing-sand)]/70">
          <a
            href="https://www.lunieshop.com.br/"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--landing-sand)]"
          >
            Loja
          </a>
          <a
            href="https://instagram.com/Luniebrand"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--landing-sand)]"
          >
            Instagram
          </a>
          <a
            href="https://wa.me/5511913696577"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--landing-sand)]"
          >
            WhatsApp
          </a>
          <Link href="/admin/login" className="hover:text-[var(--landing-sand)]">
            Admin
          </Link>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-7xl text-xs text-[var(--landing-sand)]/40">
        © 2026 LUNIE
      </p>
    </footer>
  );
}
