import Image from "next/image";

import { LunieMark } from "@/components/lunie-mark";

const SHOP_URL = "https://www.lunieshop.com.br/produtos/";

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[var(--landing-espresso)]">
      <Image
        src="/landing/hero.jpg"
        alt="Peça LUNIE em crochê dourado com broche"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center landing-ken-burns"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(233,221,206,0.18)_0%,rgba(102,70,55,0.15)_40%,rgba(102,70,55,0.78)_100%)]" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24">
        <div className="landing-reveal mb-5">
          <LunieMark className="h-14 w-52 bg-[var(--landing-sand)] sm:h-20 sm:w-72" />
        </div>
        <h1 className="landing-reveal landing-reveal-delay-1 max-w-2xl font-[family-name:var(--font-cormorant)] text-[clamp(2.8rem,8vw,5.5rem)] leading-[0.95] font-medium tracking-tight text-[var(--landing-sand)]">
          Feito à mão. Feito para a ocasião.
        </h1>
        <p className="landing-reveal landing-reveal-delay-2 mt-5 max-w-md text-sm leading-7 text-[var(--landing-sand)]/85 sm:text-base">
          Vestidos e peças artesanais em crochê, brilho e silhueta marcada —
          a mesma linha da loja LUNIE.
        </p>
        <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-wrap items-center gap-4">
          <a
            href={SHOP_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center bg-[var(--landing-sand)] px-7 py-3 text-[11px] tracking-[0.28em] text-[var(--landing-espresso)] uppercase transition hover:bg-white"
          >
            Ver loja
          </a>
          <a
            href="#destaques"
            className="inline-flex items-center justify-center border border-[var(--landing-sand)]/50 px-7 py-3 text-[11px] tracking-[0.28em] text-[var(--landing-sand)] uppercase transition hover:border-[var(--landing-sand)]"
          >
            Destaques
          </a>
        </div>
      </div>
    </section>
  );
}
