import type { Credentials } from "@/lib/credentials";
import { asArray, asNumber, asRecord, asString, localizedText } from "@/lib/json";
import type { PaymentState, RawSale, SourceVariant } from "@/lib/types";

const PAGE_SIZE = 50;
const MAX_PAGES = 30;

export async function fetchNuvemshopVariants(
  credentials: Credentials,
): Promise<SourceVariant[]> {
  const rows = await paginate(credentials, "/products");
  return rows.flatMap((row) => normalizeNuvemshopProduct(row));
}

export async function fetchNuvemshopSales(
  credentials: Credentials,
  since: Date,
): Promise<RawSale[]> {
  const rows = await paginate(
    credentials,
    `/orders?created_at_min=${encodeURIComponent(since.toISOString())}`,
  );
  return rows.flatMap((row) => normalizeNuvemshopOrder(row));
}

async function paginate(credentials: Credentials, pathAndQuery: string): Promise<unknown[]> {
  const collected: unknown[] = [];
  const [pathname, existingQuery] = pathAndQuery.split("?");
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const params = new URLSearchParams(existingQuery ?? "");
    params.set("page", String(page));
    params.set("per_page", String(PAGE_SIZE));
    const url = `${apiBase(credentials)}${pathname}?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${credentials.nuvemshopToken}`,
        "User-Agent": credentials.nuvemshopUserAgent,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "A Nuvemshop recusou o token. Confira o access token, o store id e os escopos read_products e read_orders.",
      );
    }
    if (response.status === 429) {
      throw new Error("A Nuvemshop limitou as consultas. Espere um instante e sincronize de novo.");
    }
    if (!response.ok) {
      throw new Error(`Nuvemshop respondeu ${response.status} em ${pathname}.`);
    }
    const payload: unknown = await response.json();
    const rows = asArray(payload);
    collected.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    await delay(350);
  }
  return collected;
}

function apiBase(credentials: Credentials): string {
  return `https://api.nuvemshop.com.br/${credentials.nuvemshopVersion}/${credentials.nuvemshopStoreId}`;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function normalizeNuvemshopProduct(value: unknown): SourceVariant[] {
  const record = asRecord(value);
  if (!record) return [];
  const productId = asString(record.id) || "sem-id";
  const productName = localizedText(record.name) || "Produto sem nome";
  const brand = asString(record.brand) || localizedText(record.brand) || "LUNIE";
  const categories = asArray(record.categories);
  const firstCategory = asRecord(categories[0]);
  const category = firstCategory
    ? localizedText(firstCategory.name) || "Sem categoria"
    : "Sem categoria";
  const attributeNames = asArray(record.attributes).map((attribute) =>
    localizedText(attribute).toLowerCase(),
  );
  return asArray(record.variants).flatMap((variantValue, index) => {
    const variant = asRecord(variantValue);
    if (!variant) return [];
    const values = asArray(variant.values).map((item) => localizedText(item));
    const size = attributeValue(attributeNames, values, ["tamanho", "size", "tam"]) || values[0] || "—";
    const color =
      attributeValue(attributeNames, values, ["cor", "color"]) ||
      (values.length > 1 ? values[1] ?? "—" : "—");
    const managesStock = variant.stock_management !== false;
    const stock = managesStock ? asNumber(variant.stock) : null;
    return [
      {
        source: "nuvemshop" as const,
        productName,
        category,
        brand,
        barcode: asString(variant.sku),
        size,
        color,
        stock,
        minStock: 0,
        price: asNumber(variant.price) ?? 0,
        productId,
        variantId: asString(variant.id) || `${productId}-${index}`,
      },
    ];
  });
}

function attributeValue(
  names: string[],
  values: string[],
  needles: string[],
): string {
  const index = names.findIndex((name) => needles.some((needle) => name.includes(needle)));
  if (index < 0) return "";
  return values[index] ?? "";
}

export function normalizeNuvemshopOrder(value: unknown): RawSale[] {
  const record = asRecord(value);
  if (!record) return [];
  const orderId = asString(record.number) || asString(record.id) || "sem-pedido";
  const createdAt = asString(record.created_at) || new Date(0).toISOString();
  const payment = paymentState(asString(record.status), asString(record.payment_status));
  return asArray(record.products).flatMap((productValue) => {
    const product = asRecord(productValue);
    if (!product) return [];
    const quantity = asNumber(product.quantity) ?? 0;
    if (quantity <= 0) return [];
    const variantValues = asArray(product.variant_values).map((item) =>
      typeof item === "string" ? item : localizedText(item),
    );
    return [
      {
        orderId,
        createdAt,
        barcode: asString(product.sku),
        productName: localizedText(product.name) || asString(product.name) || "Produto",
        size: variantValues[1] || variantValues[0] || "—",
        color: variantValues[0] || "—",
        quantity,
        unitPrice: asNumber(product.price) ?? 0,
        payment,
      },
    ];
  });
}

export function paymentState(status: string, paymentStatus: string): PaymentState {
  const normalizedStatus = status.toLowerCase();
  const normalizedPayment = paymentStatus.toLowerCase();
  if (
    normalizedStatus === "cancelled" ||
    normalizedPayment === "voided" ||
    normalizedPayment === "refunded" ||
    normalizedPayment === "abandoned"
  ) {
    return "cancelado";
  }
  if (normalizedPayment === "paid" || normalizedStatus === "closed") return "pago";
  return "pendente";
}
