import type { CatalogVariant, Product, SaleLine, Snapshot } from "@/lib/types";

export const DEMO_BARCODES = {
  vestidoAreiaM: "7891000000003",
  vestidoAreiaGg: "7891000000005",
  saiaPretoP: "7891000000041",
  bodyPretoP: "7891000000051",
  cinto: "7891000000061",
  brinco: "7891000000071",
  blazerAreiaM: "7891000000032",
} as const;

type DraftVariant = {
  barcode: string;
  size: string;
  color: string;
  price: number;
  minStock: number;
  hiperStock: number | null;
  nuvemshopStock: number | null;
  onHiper: boolean;
  onNuvemshop: boolean;
};

type DraftProduct = {
  name: string;
  category: string;
  variants: DraftVariant[];
};

type SaleDraft = {
  barcode: string;
  total: number;
  recent: number;
  cancelled?: number;
};

const PRODUCTS: readonly DraftProduct[] = [
  {
    name: "Vestido Linho Luna",
    category: "Vestidos",
    variants: [
      piece("7891000000001", "PP", "Areia", 790, 4, 4),
      piece("7891000000002", "P", "Areia", 790, 3, 3),
      piece("7891000000003", "M", "Areia", 790, 1, 1),
      piece("7891000000004", "G", "Areia", 790, 6, 6),
      piece("7891000000005", "GG", "Areia", 790, 14, 14),
      piece("7891000000006", "M", "Preto", 790, 2, 0),
    ],
  },
  {
    name: "Camisa Seda Íris",
    category: "Camisas",
    variants: [
      piece("7891000000011", "P", "Off-white", 640, 6, 6),
      piece("7891000000012", "M", "Off-white", 640, 8, 8),
      piece("7891000000013", "G", "Off-white", 640, 5, 5),
    ],
  },
  {
    name: "Calça Alfaiataria Norte",
    category: "Calças",
    variants: [
      piece("7891000000021", "36", "Preto", 720, 2, 2),
      piece("7891000000022", "38", "Preto", 720, 8, 8),
      piece("7891000000023", "40", "Preto", 720, 11, 11),
      piece("7891000000024", "42", "Preto", 720, 9, 9),
    ],
  },
  {
    name: "Blazer Estruturado Órbita",
    category: "Blazers",
    variants: [
      piece("7891000000031", "P", "Areia", 890, 10, 10),
      piece("7891000000032", "M", "Areia", 890, 12, 12),
      piece("7891000000033", "G", "Areia", 890, 9, 9),
    ],
  },
  {
    name: "Saia Midi Véu",
    category: "Saias",
    variants: [
      piece("7891000000041", "P", "Preto", 560, 0, 0),
      piece("7891000000042", "M", "Preto", 560, 1, 1),
      piece("7891000000043", "G", "Preto", 560, 7, 7),
    ],
  },
  {
    name: "Body Malha Noite",
    category: "Bodies",
    variants: [
      piece("7891000000051", "P", "Preto", 420, 8, 2),
      piece("7891000000052", "M", "Preto", 420, 6, 6),
    ],
  },
  {
    name: "Cinto Couro Fino",
    category: "Acessórios",
    variants: [
      {
        barcode: "7891000000061",
        size: "Único",
        color: "Preto",
        price: 290,
        minStock: 2,
        hiperStock: 12,
        nuvemshopStock: null,
        onHiper: true,
        onNuvemshop: false,
      },
    ],
  },
  {
    name: "Brinco Argola Sol",
    category: "Acessórios",
    variants: [
      {
        barcode: "7891000000071",
        size: "Único",
        color: "Dourado",
        price: 180,
        minStock: 2,
        hiperStock: null,
        nuvemshopStock: 4,
        onHiper: false,
        onNuvemshop: true,
      },
    ],
  },
];

const SALES: readonly SaleDraft[] = [
  { barcode: "7891000000001", total: 1, recent: 1 },
  { barcode: "7891000000002", total: 2, recent: 1 },
  { barcode: "7891000000003", total: 18, recent: 8, cancelled: 1 },
  { barcode: "7891000000004", total: 4, recent: 1 },
  { barcode: "7891000000006", total: 9, recent: 4 },
  { barcode: "7891000000011", total: 3, recent: 1 },
  { barcode: "7891000000012", total: 5, recent: 2 },
  { barcode: "7891000000013", total: 2, recent: 1 },
  { barcode: "7891000000021", total: 7, recent: 3 },
  { barcode: "7891000000022", total: 3, recent: 1 },
  { barcode: "7891000000024", total: 1, recent: 0 },
  { barcode: "7891000000041", total: 6, recent: 3 },
  { barcode: "7891000000042", total: 8, recent: 4 },
  { barcode: "7891000000043", total: 1, recent: 0 },
  { barcode: "7891000000051", total: 2, recent: 1 },
  { barcode: "7891000000052", total: 3, recent: 1 },
  { barcode: "7891000000071", total: 5, recent: 2 },
];

function piece(
  barcode: string,
  size: string,
  color: string,
  price: number,
  hiperStock: number,
  nuvemshopStock: number,
): DraftVariant {
  return {
    barcode,
    size,
    color,
    price,
    minStock: 2,
    hiperStock,
    nuvemshopStock,
    onHiper: true,
    onNuvemshop: true,
  };
}

function daysAgoIso(now: Date, days: number): string {
  const date = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return date.toISOString();
}

function productId(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildDemoSnapshot(now: Date): Snapshot {
  const lookup = new Map<string, { product: DraftProduct; variant: DraftVariant }>();
  const products: Product[] = PRODUCTS.map((product) => {
    const id = productId(product.name);
    const variants: CatalogVariant[] = product.variants.map((variant) => {
      lookup.set(variant.barcode, { product, variant });
      return {
        id: variant.barcode,
        productId: id,
        productName: product.name,
        category: product.category,
        brand: "LUNIE",
        barcode: variant.barcode,
        size: variant.size,
        color: variant.color,
        price: variant.price,
        minStock: variant.minStock,
        hiperStock: variant.hiperStock,
        nuvemshopStock: variant.nuvemshopStock,
        onHiper: variant.onHiper,
        onNuvemshop: variant.onNuvemshop,
        hiperProductId: variant.onHiper ? `hiper-${id}` : null,
        nuvemshopProductId: variant.onNuvemshop ? `nuvem-${id}` : null,
      };
    });
    return {
      id,
      name: product.name,
      category: product.category,
      brand: "LUNIE",
      variants,
    };
  });

  const sales: SaleLine[] = [];
  let sequence = 1;
  for (const draft of SALES) {
    const match = lookup.get(draft.barcode);
    if (!match) continue;
    const paidDays = saleDays(draft.total, draft.recent);
    for (const days of paidDays) {
      sales.push(
        saleLine(sequence, match.product, match.variant, daysAgoIso(now, days), "pago"),
      );
      sequence += 1;
    }
    const cancelled = draft.cancelled ?? 0;
    for (let index = 0; index < cancelled; index += 1) {
      sales.push(
        saleLine(
          sequence,
          match.product,
          match.variant,
          daysAgoIso(now, 2),
          "cancelado",
        ),
      );
      sequence += 1;
    }
  }

  return {
    mode: "demo",
    syncedAt: now.toISOString(),
    products,
    sales,
    warnings: [],
  };
}

function saleDays(total: number, recent: number): number[] {
  const days: number[] = [];
  const recentCount = Math.min(recent, total);
  for (let index = 0; index < recentCount; index += 1) {
    days.push((index % 6) + 1);
  }
  for (let index = 0; index < total - recentCount; index += 1) {
    days.push(8 + (index % 20));
  }
  return days;
}

function saleLine(
  sequence: number,
  product: DraftProduct,
  variant: DraftVariant,
  createdAt: string,
  payment: "pago" | "cancelado",
): SaleLine {
  return {
    id: `demo-${sequence}`,
    orderId: `PED-${String(8000 + sequence)}`,
    createdAt,
    barcode: variant.barcode,
    productName: product.name,
    size: variant.size,
    color: variant.color,
    quantity: 1,
    unitPrice: variant.price,
    payment,
  };
}
