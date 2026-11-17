import Image from "next/image";

const LOOKS = [
  {
    name: "Vestido Spiral",
    price: "R$ 6.600",
    image: "/landing/look-01.jpg",
    href: "https://www.lunieshop.com.br/produtos/vestido-spiral-11ox8/",
  },
  {
    name: "Vestido Golden",
    price: "R$ 4.200",
    image: "/landing/look-02.jpg",
    href: "https://www.lunieshop.com.br/produtos/vestido-golden-1hay5/",
  },
  {
    name: "Vestido Essence",
    price: "R$ 3.150",
    image: "/landing/look-03.jpg",
    href: "https://www.lunieshop.com.br/produtos/vestido-essence-gqtwn/",
  },
  {
    name: "Vestido Harmony",
    price: "R$ 2.510",
    image: "/landing/look-04.jpg",
    href: "https://www.lunieshop.com.br/produtos/vestido-harmony-hlq4z/",
  },
] as const;

export function LandingLooks() {
  return (
    <section
      id="destaques"
      className="bg-[var(--landing-clay)]/35 px-5 py-20 text-[var(--landing-espresso)] sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] tracking-[0.35em] text-[var(--landing-terra)] uppercase">
              Destaques
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-none sm:text-5xl">
              Peças da loja.
            </h2>
          </div>
          <a
            href="https://www.lunieshop.com.br/produtos/"
            target="_blank"
            rel="noreferrer"
            className="text-[11px] tracking-[0.28em] text-[var(--landing-mocha)] uppercase underline-offset-4 hover:text-[var(--landing-espresso)] hover:underline"
          >
            Ver todos
          </a>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {LOOKS.map((look) => (
            <a
              key={look.name}
              href={look.href}
              target="_blank"
              rel="noreferrer"
              className="group block"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-[var(--landing-sand)]">
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
              <p className="mt-1 text-sm text-[var(--landing-mocha)]">{look.price}</p>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
