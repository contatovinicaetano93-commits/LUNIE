import { slug } from "@/lib/format";
import type {
  CatalogVariant,
  Product,
  RawSale,
  SaleLine,
  Snapshot,
  SourceVariant,
} from "@/lib/types";

type MutableVariant = {
  key: string;
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
  onHiper: boolean;
  onNuvemshop: boolean;
  hiperProductId: string | null;
  nuvemshopProductId: string | null;
};

export function buildSnapshot(input: {
  mode: "demo" | "live";
  syncedAt: string;
  hiper: SourceVariant[];
  nuvemshop: SourceVariant[];
  sales: RawSale[];
}): Snapshot {
  const { products, warnings } = mergeProducts(input.hiper, input.nuvemshop);
  const sales: SaleLine[] = input.sales.map((sale, index) => ({
    id: `${sale.orderId}-${index}`,
    orderId: sale.orderId,
    createdAt: sale.createdAt,
    barcode: sale.barcode,
    productName: sale.productName,
    size: sale.size,
    color: sale.color,
    quantity: sale.quantity,
    unitPrice: sale.unitPrice,
    payment: sale.payment,
  }));
  return {
    mode: input.mode,
    syncedAt: input.syncedAt,
    products,
    sales,
    warnings,
  };
}

export function mergeProducts(
  hiper: SourceVariant[],
  nuvemshop: SourceVariant[],
): { products: Product[]; warnings: string[] } {
  const warnings: string[] = [];
  const byBarcode = new Map<string, MutableVariant>();
  const loose: MutableVariant[] = [];

  absorb(hiper, byBarcode, loose, warnings);
  absorb(nuvemshop, byBarcode, loose, warnings);

  const variants = [...byBarcode.values(), ...loose];
  const groups = cluster(variants);
  const products = groups.map((group) => toProduct(group));
  products.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  return { products, warnings };
}

function absorb(
  rows: SourceVariant[],
  byBarcode: Map<string, MutableVariant>,
  loose: MutableVariant[],
  warnings: string[],
): void {
  const seen = new Set<string>();
  const repeated = new Map<string, number>();
  for (const row of rows) {
    const barcode = row.barcode.trim();
    if (!barcode) {
      loose.push(fromSource(row, `sem-codigo-${row.source}-${row.productId}-${row.variantId}`));
      continue;
    }
    const duplicateKey = `${row.source}:${barcode}`;
    if (seen.has(duplicateKey)) {
      repeated.set(row.source, (repeated.get(row.source) ?? 0) + 1);
      continue;
    }
    seen.add(duplicateKey);
    const current = byBarcode.get(barcode);
    if (!current) {
      byBarcode.set(barcode, fromSource(row, barcode));
      continue;
    }
    if (row.source === "hiper" && current.onHiper) {
      warnings.push(`Código ${barcode} já estava no Hiper. A leitura extra foi ignorada.`);
      continue;
    }
    if (row.source === "nuvemshop" && current.onNuvemshop) {
      warnings.push(
        `Código ${barcode} já estava na Nuvemshop. A leitura extra foi ignorada.`,
      );
      continue;
    }
    applySource(current, row);
  }
  for (const [source, count] of repeated) {
    warnings.push(
      `${count} códigos repetidos no ${sourceName(source)}. Em cada um, a primeira ocorrência foi mantida.`,
    );
  }
}

function fromSource(row: SourceVariant, key: string): MutableVariant {
  const variant: MutableVariant = {
    key,
    productName: row.productName || "Produto sem nome",
    category: row.category || "Sem categoria",
    brand: row.brand || "LUNIE",
    barcode: row.barcode.trim(),
    size: row.size || "—",
    color: row.color || "—",
    price: row.price,
    minStock: row.minStock,
    hiperStock: null,
    nuvemshopStock: null,
    onHiper: false,
    onNuvemshop: false,
    hiperProductId: null,
    nuvemshopProductId: null,
  };
  applySource(variant, row);
  return variant;
}

function applySource(variant: MutableVariant, row: SourceVariant): void {
  if (row.source === "hiper") {
    variant.onHiper = true;
    variant.hiperStock = row.stock;
    variant.hiperProductId = row.productId;
    variant.minStock = row.minStock;
    if (row.productName) variant.productName = row.productName;
    if (row.category) variant.category = row.category;
    if (row.price > 0) variant.price = row.price;
  } else {
    variant.onNuvemshop = true;
    variant.nuvemshopStock = row.stock;
    variant.nuvemshopProductId = row.productId;
    if (!variant.onHiper) {
      if (row.productName) variant.productName = row.productName;
      if (row.category) variant.category = row.category;
      if (row.price > 0) variant.price = row.price;
    }
  }
  if (row.size) variant.size = row.size;
  if (row.color) variant.color = row.color;
  if (row.brand) variant.brand = row.brand;
}

function sourceName(source: SourceVariant["source"]): string {
  switch (source) {
    case "hiper":
      return "Hiper";
    case "nuvemshop":
      return "Nuvemshop";
    default: {
      const exhaustive: never = source;
      return exhaustive;
    }
  }
}

function cluster(variants: MutableVariant[]): MutableVariant[][] {
  const parent = new Map<string, string>();
  const find = (key: string): string => {
    const current = parent.get(key) ?? key;
    if (current === key) return key;
    const root = find(current);
    parent.set(key, root);
    return root;
  };
  const union = (left: string, right: string) => {
    const a = find(left);
    const b = find(right);
    if (a !== b) parent.set(a, b);
  };
  for (const variant of variants) parent.set(variant.key, variant.key);
  const hiperGroups = new Map<string, string>();
  const nuvemGroups = new Map<string, string>();
  for (const variant of variants) {
    if (variant.hiperProductId) {
      const existing = hiperGroups.get(variant.hiperProductId);
      if (existing) union(existing, variant.key);
      else hiperGroups.set(variant.hiperProductId, variant.key);
    }
    if (variant.nuvemshopProductId) {
      const existing = nuvemGroups.get(variant.nuvemshopProductId);
      if (existing) union(existing, variant.key);
      else nuvemGroups.set(variant.nuvemshopProductId, variant.key);
    }
  }
  const groups = new Map<string, MutableVariant[]>();
  for (const variant of variants) {
    const root = find(variant.key);
    const list = groups.get(root) ?? [];
    list.push(variant);
    groups.set(root, list);
  }
  return [...groups.values()];
}

function toProduct(group: MutableVariant[]): Product {
  const named = group.find((variant) => variant.onHiper) ?? group[0];
  const name = named?.productName ?? "Produto sem nome";
  const id = slug(
    `${name}-${named?.hiperProductId ?? named?.nuvemshopProductId ?? named?.key ?? name}`,
  );
  const variants: CatalogVariant[] = group
    .map((variant) => ({
      id: variant.barcode || variant.key,
      productId: id,
      productName: name,
      category: named?.category ?? "Sem categoria",
      brand: named?.brand ?? "LUNIE",
      barcode: variant.barcode,
      size: variant.size,
      color: variant.color,
      price: variant.price,
      minStock: variant.minStock,
      hiperStock: variant.hiperStock,
      nuvemshopStock: variant.nuvemshopStock,
      onHiper: variant.onHiper,
      onNuvemshop: variant.onNuvemshop,
      hiperProductId: variant.hiperProductId,
      nuvemshopProductId: variant.nuvemshopProductId,
    }))
    .sort((a, b) => {
      const color = a.color.localeCompare(b.color, "pt-BR");
      if (color !== 0) return color;
      return sizeRank(a.size) - sizeRank(b.size);
    });
  return {
    id,
    name,
    category: named?.category ?? "Sem categoria",
    brand: named?.brand ?? "LUNIE",
    variants,
  };
}

function sizeRank(size: string): number {
  const order = ["PP", "P", "M", "G", "GG", "XG", "ÚNICO", "UNICO"];
  const index = order.indexOf(size.toUpperCase());
  if (index >= 0) return index;
  const numeric = Number(size);
  if (Number.isFinite(numeric)) return 100 + numeric;
  return 1000;
}
