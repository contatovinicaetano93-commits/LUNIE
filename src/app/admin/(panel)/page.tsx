import { Suspense } from "react";

import { EmptyState, PageIntro } from "@/components/page-intro";
import { PeriodBar } from "@/components/period-bar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatBRL, formatCover, formatNumber } from "@/lib/format";
import { windowLabel } from "@/lib/filters";
import { loadView } from "@/lib/view";

export const metadata = { title: "Visão" };

export default async function VisaoPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const { workspace, filters, analysis } = await loadView(params);
  const waiting = workspace.status === "awaiting-sync";

  return (
    <>
      <PageIntro
        title="Visão da operação"
        description="Saldo de planejamento, o que saiu na loja e o que pede reposição. O saldo preferido é o do Hiper. A entrada local só ajusta esta conta."
      />
      <Suspense fallback={null}>
        <PeriodBar />
      </Suspense>
      {waiting ? (
        <EmptyState
          title="Nada sincronizado ainda"
          body="As chaves do Hiper e da Nuvemshop já estão no ambiente. Use Sincronizar para puxar produtos e pedidos."
        />
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Metric
              label="Peças em estoque"
              value={formatNumber(analysis.kpis.pieces)}
              hint="Saldo de planejamento, já com registros locais."
            />
            <Metric
              label="SKUs em risco"
              value={formatNumber(analysis.kpis.riskSkus)}
              hint="Cobertura abaixo de 7 dias ou no estoque mínimo, com venda no período."
            />
            <Metric
              label="Cobertura mediana"
              value={formatCover(analysis.kpis.medianCover)}
              hint="Entre as variantes que venderam na janela."
            />
            <Metric
              label="Faturamento"
              value={formatBRL(analysis.kpis.revenue)}
              hint={`Pedidos pagos em ${windowLabel(filters.windowDays)}.`}
            />
            <Metric
              label="Unidades vendidas"
              value={formatNumber(analysis.kpis.unitsSold)}
              hint="Cancelados e pendentes ficam de fora."
            />
            <Metric
              label="Alertas"
              value={formatNumber(analysis.kpis.insightCount)}
              hint="Ruptura, grade torta, parado e saldo divergente."
            />
          </div>
          <section className="mt-8">
            <h2 className="font-display text-2xl">Alertas do período</h2>
            {analysis.insights.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhum alerta nesta janela.
              </p>
            ) : (
              <ul className="mt-4 grid gap-3">
                {analysis.insights.slice(0, 4).map((insight) => (
                  <li
                    key={insight.id}
                    className="rounded-xl bg-card px-4 py-3 ring-1 ring-foreground/10"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={insight.severity === "alta" ? "destructive" : "secondary"}>
                        {insight.severity === "alta" ? "Alta" : "Média"}
                      </Badge>
                      <p className="font-medium">{insight.title}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{insight.detail}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </>
  );
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="font-display text-3xl tracking-tight">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs leading-5 text-muted-foreground">{hint}</CardContent>
    </Card>
  );
}
