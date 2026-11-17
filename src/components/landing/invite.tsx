import Image from "next/image";

const LAUNCHES = [
  {
    name: "Vestido Divine",
    price: "R$ 4.400",
    image: "/landing/look-05.jpg",
    href: "https://www.lunieshop.com.br/produtos/vestido-divine-2ti5e/",
  },
  {
    name: "Vestido Sequence",
    price: "R$ 3.290",
    image: "/landing/look-06.jpg",
    href: "https://www.lunieshop.com.br/produtos/vestido-sequence-9tt1x/",
  },
] as const;

export function LandingInvite() {
  return (
    <section
      id="novidades"
      className="bg-[var(--landing-sand)] px-5 py-20 text-[var(--landing-espresso)] sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-2xl">
          <p className="text-[11px] tracking-[0.35em] text-[var(--landing-terra)] uppercase">
            Lançamentos
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-none sm:text-5xl">
            Novidades da temporada.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--landing-mocha)]">
            As mesmas peças publicadas em lunieshop.com.br, com frete e
            atendimento pela loja.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {LAUNCHES.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group relative min-h-[24rem] overflow-hidden"
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(102,70,55,0.82)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--landing-sand)]">
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--landing-sand)]/80">{item.price}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-14 border-t border-[var(--landing-clay)] pt-12 text-center">
          <p className="text-[11px] tracking-[0.42em] text-[var(--landing-terra)] uppercase">
            Loja oficial
          </p>
          <h3 className="mt-4 font-[family-name:var(--font-cormorant)] text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]">
            Comprar em lunieshop.com.br
          </h3>
          <a
            href="https://www.lunieshop.com.br/"
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-flex items-center justify-center bg-[var(--landing-espresso)] px-8 py-3 text-[11px] tracking-[0.28em] text-[var(--landing-sand)] uppercase transition hover:bg-[var(--landing-terra)]"
          >
            Ir para a loja
          </a>
        </div>
      </div>
    </section>
  );
}
