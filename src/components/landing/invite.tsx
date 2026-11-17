export function LandingInvite() {
  return (
    <section
      id="convite"
      className="relative overflow-hidden bg-[#0c0a09] px-5 py-24 text-center text-[var(--landing-ivory)] sm:px-8 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(196,165,116,0.16),transparent_55%)]" />
      <div className="relative mx-auto max-w-3xl">
        <p className="text-[11px] tracking-[0.42em] text-[var(--landing-gold)] uppercase">
          Um convite privado
        </p>
        <h2 className="mt-5 font-[family-name:var(--font-cormorant)] text-[clamp(2.4rem,6vw,4.5rem)] leading-[1.05]">
          Elevate every occasion.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[var(--landing-ivory)]/70">
          Frete especial em pedidos selecionados, parcelamento e retirada em
          loja. A coleção completa está pronta para a sua próxima saída.
        </p>
        <a
          href="#colecoes"
          className="mt-8 inline-flex items-center justify-center bg-[var(--landing-gold)] px-8 py-3 text-[11px] tracking-[0.28em] text-[#0c0a09] uppercase transition hover:brightness-110"
        >
          Entrar na coleção
        </a>
      </div>
    </section>
  );
}
