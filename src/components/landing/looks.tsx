import Image from "next/image";

const LOOKS = [
  {
    name: "Asymmetric Night",
    note: "Maxi com fenda e ombro marcado",
    image: "/landing/look-01.jpg",
  },
  {
    name: "Private Invitation",
    note: "Silhueta justa, brilho controlado",
    image: "/landing/hero.jpg",
  },
  {
    name: "After Dark",
    note: "Preto absoluto para a última mesa",
    image: "/landing/look-03.jpg",
  },
  {
    name: "City Arrival",
    note: "Midi estruturado, passo largo",
    image: "/landing/look-02.jpg",
  },
] as const;

export function LandingLooks() {
  return (
    <section id="looks" className="bg-[#14110f] px-5 py-20 text-[var(--landing-ivory)] sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-[var(--landing-gold)] uppercase">
              Looks
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-none sm:text-5xl">
              Vistos e desejados.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-[var(--landing-ivory)]/65">
            Uma seleção editorial das peças que definem a temporada LUNIE.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {LOOKS.map((look) => (
            <article key={look.name} className="group">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={look.image}
                  alt={look.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 25vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="mt-4 font-[family-name:var(--font-cormorant)] text-2xl">
                {look.name}
              </h3>
              <p className="mt-1 text-sm text-[var(--landing-ivory)]/65">{look.note}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
