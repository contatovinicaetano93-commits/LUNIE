import Image from "next/image";

import { LunieMark } from "@/components/lunie-mark";

export function LandingHero() {
  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#0c0a09]">
      <Image
        src="/landing/hero.jpg"
        alt="Modelo LUNIE em look de ocasião"
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_18%] landing-ken-burns"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,10,9,0.45)_0%,rgba(12,10,9,0.2)_40%,rgba(12,10,9,0.78)_100%)]" />
      <div className="relative mx-auto flex min-h-[100svh] max-w-7xl flex-col justify-end px-5 pb-16 pt-28 sm:px-8 sm:pb-24">
        <div className="landing-reveal mb-4">
          <LunieMark className="h-16 w-60 bg-[var(--landing-ivory)] sm:h-24 sm:w-80" />
        </div>
        <p
          aria-hidden="true"
          className="landing-reveal landing-reveal-delay-1 mb-3 font-[family-name:var(--font-cormorant)] text-[clamp(3.5rem,12vw,8rem)] leading-none font-semibold tracking-[0.08em] text-[var(--landing-ivory)]"
        >
          LUNIE
        </p>
        <h1 className="landing-reveal landing-reveal-delay-2 max-w-3xl font-[family-name:var(--font-cormorant)] text-[clamp(1.7rem,4.5vw,2.75rem)] leading-[1.15] font-medium tracking-tight text-[var(--landing-ivory)]/92">
          Presente em cada entrada.
        </h1>
        <p className="landing-reveal landing-reveal-delay-3 mt-5 max-w-md text-sm leading-7 text-[var(--landing-ivory)]/80 sm:text-base">
          Vestidos e peças de ocasião com silhueta marcada, tecido nobre e brilho
          que acompanha a noite.
        </p>
        <div className="landing-reveal landing-reveal-delay-3 mt-8 flex flex-wrap items-center gap-4" style={{ animationDelay: "420ms" }}>
          <a
            href="#colecoes"
            className="inline-flex items-center justify-center bg-[var(--landing-ivory)] px-7 py-3 text-[11px] tracking-[0.28em] text-[#0c0a09] uppercase transition hover:bg-white"
          >
            Ver coleção
          </a>
          <a
            href="#looks"
            className="inline-flex items-center justify-center border border-[var(--landing-ivory)]/45 px-7 py-3 text-[11px] tracking-[0.28em] text-[var(--landing-ivory)] uppercase transition hover:border-[var(--landing-ivory)]"
          >
            Explorar looks
          </a>
        </div>
      </div>
    </section>
  );
}
