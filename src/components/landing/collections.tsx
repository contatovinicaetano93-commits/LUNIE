import Image from "next/image";

const COLLECTIONS = [
  {
    title: "Vestidos",
    copy: "Peças longas e midi para a noite e o dia especial.",
    image: "/landing/look-03.jpg",
    href: "https://www.lunieshop.com.br/vestidos/",
  },
  {
    title: "Handmade",
    copy: "Crochê, macramê e detalhes feitos à mão.",
    image: "/landing/look-01.jpg",
    href: "https://www.lunieshop.com.br/handmade-gu3av/",
  },
  {
    title: "Conjuntos",
    copy: "Combinações com presença e caimento.",
    image: "/landing/look-05.jpg",
    href: "https://lunieshop.com.br/conjuntos1/",
  },
] as const;

export function LandingCollections() {
  return (
    <section
      id="colecoes"
      className="bg-[var(--landing-sand)] px-5 py-20 text-[var(--landing-espresso)] sm:px-8 sm:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-xl">
          <p className="text-[11px] tracking-[0.35em] text-[var(--landing-terra)] uppercase">
            Coleções
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-none sm:text-5xl">
            Escolha o momento.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--landing-mocha)]">
            A mesma curadoria da loja: vestidos, handmade e conjuntos.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {COLLECTIONS.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              className="group relative block min-h-[28rem] overflow-hidden landing-rise"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[rgba(102,70,55,0.88)] via-[rgba(102,70,55,0.25)] to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-[var(--landing-sand)]">
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--landing-sand)]/80">
                  {item.copy}
                </p>
                <span className="mt-4 inline-block text-[11px] tracking-[0.28em] text-[var(--landing-clay)] uppercase">
                  Abrir na loja
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
