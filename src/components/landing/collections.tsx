import Image from "next/image";

const COLLECTIONS = [
  {
    title: "Vestidos longos",
    copy: "Linha alongada para noites que pedem presença.",
    image: "/landing/look-02.jpg",
    href: "#looks",
  },
  {
    title: "Mini & midi",
    copy: "Cortes curtos e médios com estrutura e movimento.",
    image: "/landing/look-01.jpg",
    href: "#looks",
  },
  {
    title: "Noite",
    copy: "Brilho, caimento e silhueta para a última hora.",
    image: "/landing/look-03.jpg",
    href: "#looks",
  },
] as const;

export function LandingCollections() {
  return (
    <section id="colecoes" className="bg-[#0c0a09] px-5 py-20 text-[var(--landing-ivory)] sm:px-8 sm:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 max-w-xl">
          <p className="text-[11px] tracking-[0.35em] text-[var(--landing-gold)] uppercase">
            Coleções
          </p>
          <h2 className="mt-3 font-[family-name:var(--font-cormorant)] text-4xl leading-none sm:text-5xl">
            Escolha o momento.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[var(--landing-ivory)]/70">
            Três caminhos. Uma mesma intenção: vestir a ocasião com precisão.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {COLLECTIONS.map((item, index) => (
            <a
              key={item.title}
              href={item.href}
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-[family-name:var(--font-cormorant)] text-3xl">
                  {item.title}
                </h3>
                <p className="mt-2 max-w-xs text-sm leading-6 text-white/75">
                  {item.copy}
                </p>
                <span className="mt-4 inline-block text-[11px] tracking-[0.28em] uppercase text-[var(--landing-gold)]">
                  Entrar
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
