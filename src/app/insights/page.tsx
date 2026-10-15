import Link from "next/link";
import { Suspense } from "react";

import { EmptyState, PageIntro } from "@/components/page-intro";
import { PeriodBar } from "@/components/period-bar";
import { Badge } from "@/components/ui/badge";
import type { InsightKind } from "@/lib/analytics";
import { loadView } from "@/lib/view";

export const metadata = { title: "Insights" };

const RULES: { kind: InsightKind; title: string; body: string }[] = [
  {
    kind: "ruptura",
    title: "Ruptura",
    body: "Cobertura abaixo de 7 dias, ou saldo no mínimo, com venda no período.",
  },
  {
    kind: "grade",
    title: "Grade torta",
    body: "No mesmo produto e cor, um tamanho gira e outro fica parado com saldo alto.",
  },
  {
    kind: "parado",
    title: "Parado",
    body: "Oito peças ou mais e nenhuma venda na janela.",
  },
  {
    kind: "divergencia",
    title: "Saldo diferente",
    body: "O número do Hiper não é o mesmo da Nuvemshop.",
  },
  {
    kind: "sem-par",
    title: "Sem par",
    body: "O código existe em só um dos lados, ou a variante não tem código de barras.",
  },
];

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { analysis } = await loadView(params);

  return (
    <>
      <PageIntro
        title="Insights"
        description="Cada alerta sai de uma regra em cima dos números desta leitura. Não há texto solto sem conta por trás."
      />
      <Suspense fallback={null}>
        <PeriodBar />
      </Suspense>
      <ul className="mb-8 grid gap-3 sm:grid-cols-2">
        {RULES.map((rule) => (
          <li key={rule.kind} className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10">
            <p className="text-sm font-medium">{rule.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{rule.body}</p>
          </li>
        ))}
      </ul>
      {analysis.insights.length === 0 ? (
        <EmptyState
          title="Nenhum alerta"
          body="A janela atual não disparou ruptura, grade torta, estoque parado nem divergência."
        />
      ) : (
        <ul className="grid gap-3">
          {analysis.insights.map((insight) => (
            <li key={insight.id} className="rounded-xl bg-card px-4 py-4 ring-1 ring-foreground/10">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={insight.severity === "alta" ? "destructive" : "secondary"}>
                  {kindLabel(insight.kind)}
                </Badge>
                <p className="font-medium">{insight.title}</p>
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{insight.detail}</p>
              <Link href={insight.href} className="mt-2 inline-block text-sm text-primary">
                Abrir na grade
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

function kindLabel(kind: InsightKind): string {
  switch (kind) {
    case "ruptura":
      return "Ruptura";
    case "parado":
      return "Parado";
    case "grade":
      return "Grade";
    case "divergencia":
      return "Divergência";
    case "sem-par":
      return "Sem par";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}
