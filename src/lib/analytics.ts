import { formatNumber } from "@/lib/format";
import type { WindowDays } from "@/lib/filters";
import type {
  CatalogVariant,
  ManualMovement,
  PairStatus,
  PaymentState,
  Product,
  SaleLine,
  Snapshot,
} from "@/lib/types";

export type VariantView = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  brand: string;
  barcode: string;
  size: string;
  color: string;
  price: number;
  minStock: number;
  hiperStock: number | null;
  nuvemshopStock: number | null;
  pair: PairStatus;
  manualNet: number;
  planningStock: number;
  unitsSold: number;
  revenue: number;
  dailyVelocity: number;
  coverDays: number | null;
  suggested: number;
  divergence: number | null;
  atRisk: boolean;
};

export type InsightKind =
  | "ruptura"
  | "parado"
  | "grade"
  | "divergencia"
  | "sem-par";

export type Insight = {
  id: string;
  kind: InsightKind;
  severity: "alta" | "media";
  title: string;
  detail: string;
  href: string;
};

export type MovementTone = "entrada" | "saida" | "cancelado" | "pendente";

export type MovementRow = {
  id: string;
  createdAt: string;
  tone: MovementTone;
  origin: "Nuvemshop" | "Registro local";
  barcode: string;
  label: string;
  quantity: number;
  note: string;
};

export type RankRow = {
  id: string;
  name: string;
  detail: string;
  units: number;
  revenue: number;
};

export type Analysis = {
  variants: VariantView[];
  kpis: {
    pieces: number;
    riskSkus: number;
    medianCover: number | null;
    revenue: number;
    unitsSold: number;
    insightCount: number;
  };
  insights: Insight[];
  movements: MovementRow[];
  replenishment: VariantView[];
  bestsellersProducts: RankRow[];
  bestsellersVariants: RankRow[];
};

export function suggestedBuy(
  unitsSold: number,
  windowDays: number,
  coverTarget: number,
  planningStock: number,
): number {
  if (windowDays <= 0 || unitsSold <= 0) return 0;
  const raw = (unitsSold / windowDays) * coverTarget - planningStock;
  if (raw <= 0) return 0;
  return Math.ceil(raw - 1e-9);
}

export function coverLength(
  planningStock: number,
  unitsSold: number,
  windowDays: number,
): number | null {
  if (unitsSold <= 0 || windowDays <= 0) return null;
  return planningStock / (unitsSold / windowDays);
}

export function pairStatus(variant: CatalogVariant): PairStatus {
  if (!variant.barcode) return "sem-codigo";
  if (variant.onHiper && variant.onNuvemshop) return "pareado";
  if (variant.onHiper) return "somente-hiper";
  if (variant.onNuvemshop) return "somente-nuvemshop";
  return "sem-codigo";
}

export function planningStockOf(
  variant: CatalogVariant,
  manualNet: number,
): number {
  const base =
    variant.onHiper && variant.hiperStock !== null
      ? variant.hiperStock
      : variant.nuvemshopStock !== null
        ? variant.nuvemshopStock
        : 0;
  return Math.max(0, base + manualNet);
}

export function analyze(input: {
  snapshot: Snapshot;
  movements: ManualMovement[];
  windowDays: WindowDays;
  coverTarget: number;
  now: Date;
}): Analysis {
  const { snapshot, movements, windowDays, coverTarget, now } = input;
  const start = now.getTime() - windowDays * 24 * 60 * 60 * 1000;
  const inWindow = (iso: string) => {
    const time = new Date(iso).getTime();
    return time >= start && time <= now.getTime();
  };

  const netByBarcode = new Map<string, number>();
  for (const movement of movements) {
    if (movement.scope !== snapshot.mode) continue;
    const sign = movement.kind === "entrada" ? movement.quantity : -movement.quantity;
    netByBarcode.set(
      movement.barcode,
      (netByBarcode.get(movement.barcode) ?? 0) + sign,
    );
  }

  const paidByBarcode = new Map<string, { units: number; revenue: number }>();
  const loosePaid: SaleLine[] = [];
  let revenue = 0;
  let unitsSold = 0;
  for (const sale of snapshot.sales) {
    if (sale.payment !== "pago" || !inWindow(sale.createdAt)) continue;
    const lineRevenue = sale.quantity * sale.unitPrice;
    revenue += lineRevenue;
    unitsSold += sale.quantity;
    if (!sale.barcode) {
      loosePaid.push(sale);
      continue;
    }
    const current = paidByBarcode.get(sale.barcode) ?? { units: 0, revenue: 0 };
    current.units += sale.quantity;
    current.revenue += lineRevenue;
    paidByBarcode.set(sale.barcode, current);
  }

  const knownBarcodes = new Set<string>();
  const variants: VariantView[] = snapshot.products.flatMap((product) =>
    product.variants.map((variant) => {
      if (variant.barcode) knownBarcodes.add(variant.barcode);
      const sold = paidByBarcode.get(variant.barcode);
      const units = variant.barcode ? (sold?.units ?? 0) : 0;
      const lineRevenue = variant.barcode ? (sold?.revenue ?? 0) : 0;
      const manualNet = variant.barcode
        ? (netByBarcode.get(variant.barcode) ?? 0)
        : 0;
      const planningStock = planningStockOf(variant, manualNet);
      const cover = coverLength(planningStock, units, windowDays);
      const pair = pairStatus(variant);
      const divergence =
        variant.hiperStock !== null && variant.nuvemshopStock !== null
          ? variant.hiperStock - variant.nuvemshopStock
          : null;
      const atRisk =
        (cover !== null && cover < 7) ||
        (variant.minStock > 0 &&
          planningStock <= variant.minStock &&
          units > 0);
      return {
        id: variant.id,
        productId: product.id,
        productName: product.name,
        category: product.category,
        brand: product.brand,
        barcode: variant.barcode,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        minStock: variant.minStock,
        hiperStock: variant.hiperStock,
        nuvemshopStock: variant.nuvemshopStock,
        pair,
        manualNet,
        planningStock,
        unitsSold: units,
        revenue: lineRevenue,
        dailyVelocity: windowDays > 0 ? units / windowDays : 0,
        coverDays: cover,
        suggested: suggestedBuy(units, windowDays, coverTarget, planningStock),
        divergence,
        atRisk,
      };
    }),
  );

  for (const [barcode, sold] of paidByBarcode) {
    if (knownBarcodes.has(barcode)) continue;
    const sample = snapshot.sales.find(
      (sale) => sale.barcode === barcode && sale.payment === "pago",
    );
    if (!sample) continue;
    variants.push(
      orphanVariant(sample, sold.units, sold.revenue, windowDays, coverTarget),
    );
  }

  variants.sort((a, b) => {
    const name = a.productName.localeCompare(b.productName, "pt-BR");
    if (name !== 0) return name;
    const color = a.color.localeCompare(b.color, "pt-BR");
    if (color !== 0) return color;
    return a.size.localeCompare(b.size, "pt-BR");
  });

  const insights = buildInsights(variants, windowDays);
  const covers = variants
    .map((variant) => variant.coverDays)
    .filter((days): days is number => days !== null);

  return {
    variants,
    kpis: {
      pieces: variants.reduce((sum, variant) => sum + variant.planningStock, 0),
      riskSkus: variants.filter((variant) => variant.atRisk).length,
      medianCover: median(covers),
      revenue,
      unitsSold,
      insightCount: insights.length,
    },
    insights,
    movements: buildMovements(snapshot, movements, now),
    replenishment: variants
      .filter((variant) => variant.suggested > 0)
      .sort((a, b) => b.suggested - a.suggested || b.unitsSold - a.unitsSold),
    bestsellersProducts: rankProducts(snapshot.products, variants, loosePaid),
    bestsellersVariants: rankVariants(variants, loosePaid),
  };
}

function orphanVariant(
  sale: SaleLine,
  units: number,
  revenue: number,
  windowDays: number,
  coverTarget: number,
): VariantView {
  const cover = coverLength(0, units, windowDays);
  return {
    id: `orfao-${sale.barcode}`,
    productId: `orfao-${sale.barcode}`,
    productName: sale.productName || "Venda sem produto",
    category: "Sem cadastro",
    brand: "—",
    barcode: sale.barcode,
    size: sale.size || "—",
    color: sale.color || "—",
    price: sale.unitPrice,
    minStock: 0,
    hiperStock: null,
    nuvemshopStock: null,
    pair: "somente-nuvemshop",
    manualNet: 0,
    planningStock: 0,
    unitsSold: units,
    revenue,
    dailyVelocity: windowDays > 0 ? units / windowDays : 0,
    coverDays: cover,
    suggested: suggestedBuy(units, windowDays, coverTarget, 0),
    divergence: null,
    atRisk: units > 0,
  };
}

function buildMovements(
  snapshot: Snapshot,
  movements: ManualMovement[],
  now: Date,
): MovementRow[] {
  const rows: MovementRow[] = [];
  for (const sale of snapshot.sales) {
    if (new Date(sale.createdAt).getTime() > now.getTime()) continue;
    rows.push({
      id: sale.id,
      createdAt: sale.createdAt,
      tone: toneOfPayment(sale.payment),
      origin: "Nuvemshop",
      barcode: sale.barcode,
      label: labelOf(sale.productName, sale.color, sale.size),
      quantity: sale.quantity,
      note: `Pedido ${sale.orderId}`,
    });
  }
  for (const movement of movements) {
    if (movement.scope !== snapshot.mode) continue;
    const variant = findVariant(snapshot, movement.barcode);
    rows.push({
      id: movement.id,
      createdAt: movement.createdAt,
      tone: movement.kind,
      origin: "Registro local",
      barcode: movement.barcode,
      label: variant
        ? labelOf(variant.productName, variant.color, variant.size)
        : movement.barcode,
      quantity: movement.quantity,
      note: movement.note,
    });
  }
  rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return rows;
}

function toneOfPayment(payment: PaymentState): MovementTone {
  switch (payment) {
    case "pago":
      return "saida";
    case "cancelado":
      return "cancelado";
    case "pendente":
      return "pendente";
    default: {
      const exhaustive: never = payment;
      return exhaustive;
    }
  }
}

function findVariant(snapshot: Snapshot, barcode: string): CatalogVariant | null {
  for (const product of snapshot.products) {
    const variant = product.variants.find((item) => item.barcode === barcode);
    if (variant) return variant;
  }
  return null;
}

function labelOf(name: string, color: string, size: string): string {
  return `${name} · ${color} · ${size}`;
}

function buildInsights(variants: VariantView[], windowDays: WindowDays): Insight[] {
  const insights: Insight[] = [];
  for (const variant of variants) {
    if (variant.atRisk && variant.unitsSold > 0) {
      const cover =
        variant.coverDays === null
          ? "sem giro"
          : `${formatNumber(Math.round(variant.coverDays))} ${Math.round(variant.coverDays) === 1 ? "dia" : "dias"} de cobertura`;
      insights.push({
        id: `ruptura-${variant.id}`,
        kind: "ruptura",
        severity: variant.planningStock === 0 || (variant.coverDays ?? 99) < 3 ? "alta" : "media",
        title: `${variant.productName} ${variant.color} ${variant.size} perto da ruptura`,
        detail: `${pecas(variant.planningStock)} no saldo de planejamento, ${vendas(variant.unitsSold)} em ${windowDays} dias, ${cover}.`,
        href: `/estoque?q=${encodeURIComponent(variant.barcode || variant.productName)}`,
      });
    }
    if (variant.planningStock >= 8 && variant.unitsSold === 0 && variant.barcode) {
      insights.push({
        id: `parado-${variant.id}`,
        kind: "parado",
        severity: "media",
        title: `${variant.productName} ${variant.color} ${variant.size} parado`,
        detail: `${pecas(variant.planningStock)} e nenhuma venda em ${windowDays} dias.`,
        href: `/estoque?q=${encodeURIComponent(variant.barcode)}`,
      });
    }
    if (variant.divergence !== null && variant.divergence !== 0) {
      insights.push({
        id: `div-${variant.id}`,
        kind: "divergencia",
        severity: Math.abs(variant.divergence) >= 3 ? "alta" : "media",
        title: `Saldo diferente em ${variant.productName} ${variant.color} ${variant.size}`,
        detail: `Hiper ${stockText(variant.hiperStock)}, Nuvemshop ${stockText(variant.nuvemshopStock)}. Diferença de ${pecas(Math.abs(variant.divergence))}.`,
        href: `/estoque?situacao=divergente&q=${encodeURIComponent(variant.barcode)}`,
      });
    }
    if (variant.pair === "somente-hiper" || variant.pair === "somente-nuvemshop" || variant.pair === "sem-codigo") {
      insights.push({
        id: `par-${variant.id}`,
        kind: "sem-par",
        severity: "media",
        title: unpairedTitle(variant),
        detail: unpairedDetail(variant),
        href: `/estoque?situacao=sem-par&q=${encodeURIComponent(variant.barcode || variant.productName)}`,
      });
    }
  }

  const groups = new Map<string, VariantView[]>();
  for (const variant of variants) {
    const key = `${variant.productId}::${variant.color}`;
    const list = groups.get(key) ?? [];
    list.push(variant);
    groups.set(key, list);
  }
  for (const [key, group] of groups) {
    if (group.length < 2) continue;
    const fast = group
      .filter(
        (variant) =>
          variant.unitsSold >= 3 &&
          variant.coverDays !== null &&
          variant.coverDays < 14,
      )
      .sort((a, b) => (a.coverDays ?? 0) - (b.coverDays ?? 0))[0];
    const slow = group
      .filter((variant) => variant.planningStock >= 6 && variant.unitsSold <= 1)
      .sort((a, b) => b.planningStock - a.planningStock)[0];
    if (!fast || !slow || fast.id === slow.id) continue;
    insights.push({
      id: `grade-${key}`,
      kind: "grade",
      severity: "alta",
      title: `Grade torta em ${fast.productName} ${fast.color}`,
      detail: `${fast.size} tem ${pecas(fast.planningStock)} e ${vendas(fast.unitsSold)} em ${windowDays} dias. ${slow.size} tem ${pecas(slow.planningStock)} e ${vendas(slow.unitsSold)}.`,
      href: `/reposicao?q=${encodeURIComponent(fast.productName)}`,
    });
  }

  const weight = (insight: Insight) => (insight.severity === "alta" ? 0 : 1);
  insights.sort((a, b) => weight(a) - weight(b) || a.title.localeCompare(b.title, "pt-BR"));
  return insights;
}

function unpairedTitle(variant: VariantView): string {
  switch (variant.pair) {
    case "somente-hiper":
      return `${variant.productName} ${variant.color} ${variant.size} só no Hiper`;
    case "somente-nuvemshop":
      return `${variant.productName} ${variant.color} ${variant.size} só na Nuvemshop`;
    case "sem-codigo":
      return `${variant.productName} ${variant.color} ${variant.size} sem código de barras`;
    case "pareado":
      return variant.productName;
    default: {
      const exhaustive: never = variant.pair;
      return exhaustive;
    }
  }
}

function unpairedDetail(variant: VariantView): string {
  switch (variant.pair) {
    case "somente-hiper":
      return `Código ${variant.barcode} não apareceu na Nuvemshop. Saldo Hiper: ${stockText(variant.hiperStock)}.`;
    case "somente-nuvemshop":
      return `Código ${variant.barcode} não apareceu no Hiper. Saldo Nuvemshop: ${stockText(variant.nuvemshopStock)}.`;
    case "sem-codigo":
      return "Sem código de barras não há como cruzar o saldo dos dois lados.";
    case "pareado":
      return "";
    default: {
      const exhaustive: never = variant.pair;
      return exhaustive;
    }
  }
}

function stockText(value: number | null): string {
  return value === null ? "sem saldo" : String(value);
}

function pecas(count: number): string {
  return count === 1 ? "1 peça" : `${formatNumber(count)} peças`;
}

function vendas(count: number): string {
  return count === 1 ? "1 venda" : `${formatNumber(count)} vendas`;
}

function rankProducts(
  products: Product[],
  variants: VariantView[],
  loosePaid: SaleLine[],
): RankRow[] {
  const rows = new Map<string, RankRow>();
  for (const product of products) {
    const related = variants.filter((variant) => variant.productId === product.id);
    const units = related.reduce((sum, variant) => sum + variant.unitsSold, 0);
    const revenue = related.reduce((sum, variant) => sum + variant.revenue, 0);
    if (units <= 0) continue;
    rows.set(product.id, {
      id: product.id,
      name: product.name,
      detail: product.category,
      units,
      revenue,
    });
  }
  for (const sale of loosePaid) {
    const id = `loose-product-${sale.productName}`;
    const current = rows.get(id) ?? {
      id,
      name: sale.productName || "Venda sem produto",
      detail: "Sem cadastro cruzado",
      units: 0,
      revenue: 0,
    };
    current.units += sale.quantity;
    current.revenue += sale.quantity * sale.unitPrice;
    rows.set(id, current);
  }
  return [...rows.values()].sort(byRank);
}

function rankVariants(variants: VariantView[], loosePaid: SaleLine[]): RankRow[] {
  const rows: RankRow[] = variants
    .filter((variant) => variant.unitsSold > 0)
    .map((variant) => ({
      id: variant.id,
      name: `${variant.productName} · ${variant.color} · ${variant.size}`,
      detail: variant.barcode || "sem código",
      units: variant.unitsSold,
      revenue: variant.revenue,
    }));
  for (const sale of loosePaid) {
    rows.push({
      id: sale.id,
      name: `${sale.productName} · ${sale.color} · ${sale.size}`,
      detail: "sem código",
      units: sale.quantity,
      revenue: sale.quantity * sale.unitPrice,
    });
  }
  return rows.sort(byRank);
}

function byRank(a: RankRow, b: RankRow): number {
  return b.units - a.units || b.revenue - a.revenue;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const left = sorted[mid - 1];
    const right = sorted[mid];
    if (left === undefined || right === undefined) return null;
    return (left + right) / 2;
  }
  return sorted[mid] ?? null;
}
