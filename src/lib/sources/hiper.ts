import type { Credentials } from "@/lib/credentials";
import {
  asRecord,
  asString,
  firstNumber,
  firstString,
  localizedText,
} from "@/lib/json";
import type { SourceVariant } from "@/lib/types";

const PAGE_SIZE = 100;
const MAX_PAGES = 40;

export async function fetchHiperVariants(
  credentials: Credentials,
): Promise<SourceVariant[]> {
  const base = credentials.hiperBaseUrl.replace(/\/$/, "");
  if (!base.startsWith("https://")) {
    throw new Error("HIPER_API_BASE_URL precisa ser um endereço https.");
  }
  const variants: SourceVariant[] = [];
  const seenPage = new Set<string>();
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(`${base}${credentials.hiperProductsPath}`);
    url.searchParams.set("pagina", String(page));
    url.searchParams.set("page", String(page));
    url.searchParams.set("limite", String(PAGE_SIZE));
    const payload = await hiperGet(url, credentials.hiperKey);
    const rows = extractRows(payload);
    if (rows.length === 0) break;
    const marker = JSON.stringify(rows[0]).slice(0, 180);
    if (seenPage.has(marker)) break;
    seenPage.add(marker);
    for (const row of rows) {
      variants.push(...normalizeHiperProduct(row));
    }
    if (rows.length < PAGE_SIZE) break;
  }
  if (variants.length === 0) {
    throw new Error(
      "O Hiper respondeu sem produtos. Confira a chave, o caminho HIPER_PRODUCTS_PATH e se os itens estão marcados para a loja virtual.",
    );
  }
  return variants;
}

async function hiperGet(url: URL, key: string): Promise<unknown> {
  const bearer = await request(url, {
    Authorization: `Bearer ${key}`,
    "X-Chave-Seguranca": key,
    Accept: "application/json",
  });
  if (bearer.ok) return bearer.payload;
  if (bearer.status === 401 || bearer.status === 403) {
    const raw = await request(url, {
      Authorization: key,
      Accept: "application/json",
    });
    if (raw.ok) return raw.payload;
    throw new Error(
      `Hiper recusou a chave de segurança (${raw.status}). Ela fica em Vendas, Loja virtual, Configurações.`,
    );
  }
  throw new Error(`Hiper respondeu ${bearer.status} em ${url.pathname}.`);
}

async function request(
  url: URL,
  headers: Record<string, string>,
): Promise<{ ok: boolean; status: number; payload: unknown }> {
  const response = await fetch(url, {
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text) as unknown;
    } catch {
      payload = null;
    }
  }
  return { ok: response.ok, status: response.status, payload };
}

export function extractRows(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  const record = asRecord(payload);
  if (!record) return [];
  for (const key of ["produtos", "products", "items", "itens", "data", "resultado", "result"]) {
    const value = record[key];
    if (Array.isArray(value)) return value;
    const nested = asRecord(value);
    if (!nested) continue;
    const inner = extractRows(nested);
    if (inner.length > 0) return inner;
  }
  return [];
}

export function normalizeHiperProduct(value: unknown): SourceVariant[] {
  const record = asRecord(value);
  if (!record) return [];
  const productId = firstString(record, ["id", "produtoId", "codigo", "produto_id"]) || "sem-id";
  const productName =
    firstString(record, ["nome", "name", "descricao", "descricaoProduto"]) ||
    localizedText(record.nome);
  const category = firstString(record, ["categoria", "category", "nomeCategoria"]) || "Sem categoria";
  const brand = firstString(record, ["marca", "brand"]) || "LUNIE";
  const active = isActive(record);
  if (!active) return [];
  const grades = gradeRows(record);
  if (grades.length === 0) {
    const single = toVariant(record, {
      productId,
      productName,
      category,
      brand,
      variantId: productId,
    });
    return single ? [single] : [];
  }
  return grades.flatMap((grade, index) => {
    const gradeRecord = asRecord(grade);
    if (!gradeRecord) return [];
    const variant = toVariant(gradeRecord, {
      productId,
      productName,
      category,
      brand,
      variantId: firstString(gradeRecord, ["id", "gradeId", "variacaoId"]) || `${productId}-${index}`,
      fallback: record,
    });
    return variant ? [variant] : [];
  });
}

function isActive(record: Record<string, unknown>): boolean {
  const status = firstString(record, ["situacao", "status", "ativo"]).toLowerCase();
  if (!status) return true;
  return !["inativo", "false", "0", "n", "nao", "não"].includes(status);
}

function gradeRows(record: Record<string, unknown>): unknown[] {
  for (const key of ["variacoes", "grades", "grade", "itens", "sku"]) {
    const value = record[key];
    if (Array.isArray(value) && value.length > 0) return value;
  }
  return [];
}

function toVariant(
  record: Record<string, unknown>,
  context: {
    productId: string;
    productName: string;
    category: string;
    brand: string;
    variantId: string;
    fallback?: Record<string, unknown>;
  },
): SourceVariant | null {
  const fallback = context.fallback;
  const barcode =
    firstString(record, [
      "codigoDeBarras",
      "codigoBarras",
      "codigo_barras",
      "codigoDeBarra",
      "ean",
      "gtin",
      "sku",
    ]) || (fallback ? firstString(fallback, ["codigoDeBarras", "codigoBarras", "sku", "ean"]) : "");
  const stock =
    firstNumber(record, [
      "quantidadeEstoque",
      "estoqueAtual",
      "estoque",
      "saldo",
      "quantidade",
      "stock",
    ]) ?? (fallback ? firstNumber(fallback, ["quantidadeEstoque", "estoque", "saldo"]) : null);
  const minStock =
    firstNumber(record, ["quantidadeMinima", "estoqueMinimo", "estoque_minimo", "minimo"]) ??
    (fallback ? firstNumber(fallback, ["quantidadeMinima", "estoqueMinimo"]) : null) ??
    0;
  const price =
    firstNumber(record, ["preco", "precoVenda", "valor", "price"]) ??
    (fallback ? firstNumber(fallback, ["preco", "precoVenda", "valor"]) : null) ??
    0;
  const size =
    firstString(record, ["tamanho", "size", "tam"]) ||
    (fallback ? firstString(fallback, ["tamanho"]) : "") ||
    "—";
  const color =
    firstString(record, ["cor", "color"]) ||
    (fallback ? firstString(fallback, ["cor"]) : "") ||
    "—";
  if (!barcode && stock === null && !context.productName) return null;
  return {
    source: "hiper",
    productName: context.productName || "Produto sem nome",
    category: context.category,
    brand: context.brand,
    barcode,
    size,
    color,
    stock,
    minStock: Math.max(0, minStock),
    price: Math.max(0, price),
    productId: context.productId,
    variantId: context.variantId || asString(record.id) || context.productId,
  };
}
