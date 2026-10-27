import type { Credentials } from "@/lib/credentials";
import {
  asArray,
  asRecord,
  asString,
  firstNumber,
  firstString,
  localizedText,
} from "@/lib/json";
import type { SourceVariant } from "@/lib/types";

const MAX_PAGES = 40;

const EMPTY_CATALOG =
  "O Hiper autenticou, mas não encontrou produtos liberados para a loja virtual. No cadastro do produto, marque Enviar produto para a loja virtual.";

export async function fetchHiperVariants(
  credentials: Credentials,
): Promise<SourceVariant[]> {
  const base = credentials.hiperBaseUrl.replace(/\/$/, "");
  if (!base.startsWith("https://")) {
    throw new Error("HIPER_API_BASE_URL precisa ser um endereço https.");
  }
  const token = await gerarToken(base, credentials.hiperKey);
  const rows = await listarProdutos(base, token);
  const variants = rows.flatMap((row) => normalizeHiperProduct(row));
  if (variants.length === 0) {
    throw new Error(EMPTY_CATALOG);
  }
  return variants;
}

async function gerarToken(base: string, key: string): Promise<string> {
  const response = await fetch(`${base}/api/v1/auth/gerar-token/${encodeURIComponent(key)}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(20000),
  });
  const payload = await readJson(response);
  const token = asString(asRecord(payload)?.token);
  if (!response.ok || !token) {
    throw new Error(
      "O Hiper recusou a chave de segurança. Ela fica em Vendas, Loja virtual, Configurações.",
    );
  }
  return token;
}

async function listarProdutos(base: string, token: string): Promise<unknown[]> {
  const collected: unknown[] = [];
  const seenPage = new Set<string>();
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const url = new URL(`${base}/api/v1/produtos/listagemDeProdutos`);
    url.searchParams.set("pontoDeSincronizacao", "0");
    url.searchParams.set("pagina", String(page));
    const payload = await hiperGet(url, token);
    const failure = failureMessage(payload);
    if (failure) {
      if (page === 1) throw new Error(failure);
      break;
    }
    const rows = extractRows(payload);
    if (rows.length === 0) break;
    const marker = JSON.stringify(rows[0]).slice(0, 180);
    if (seenPage.has(marker)) break;
    seenPage.add(marker);
    collected.push(...rows);
  }
  return collected;
}

async function hiperGet(url: URL, token: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
    signal: AbortSignal.timeout(30000),
  });
  const payload = await readJson(response);
  if (response.status === 401 || response.status === 403) {
    throw new Error(
      "O Hiper recusou o token. A chave de segurança fica em Vendas, Loja virtual, Configurações.",
    );
  }
  if (!response.ok && response.status !== 400) {
    throw new Error(`Hiper respondeu ${response.status} em ${url.pathname}.`);
  }
  return payload;
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function failureMessage(payload: unknown): string | null {
  const record = asRecord(payload);
  if (!record) return null;
  if (asArray(record.produtos).length > 0) return null;
  const errors = asArray(record.errors).map((item) => asString(item)).filter(Boolean);
  if (errors.some((error) => error.toLowerCase().includes("nenhum produto"))) {
    return EMPTY_CATALOG;
  }
  if (errors.length > 0) return errors.join(" ");
  return null;
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
    if (!gradeRecord || gradeRecord.variacaoAtiva === false) return [];
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
  if (record.removido === true || record.ativo === false) return false;
  const status = firstString(record, ["situacao", "status"]).toLowerCase();
  if (!status) return true;
  return !["inativo", "false", "0", "n", "nao", "não"].includes(status);
}

function gradeRows(record: Record<string, unknown>): unknown[] {
  for (const key of ["variacao", "variacoes", "grades", "grade", "itens", "sku"]) {
    const value = record[key];
    if (Array.isArray(value) && value.length > 0) return value;
    if (key === "variacao") {
      const single = asRecord(value);
      if (single) return [single];
    }
  }
  return [];
}

function variationAxes(record: Record<string, unknown>): { size: string; color: string } {
  const pairs: Array<[string, string]> = [
    [firstString(record, ["tipoVariacaoA"]), firstString(record, ["nomeVariacaoA"])],
    [firstString(record, ["tipoVariacaoB"]), firstString(record, ["nomeVariacaoB"])],
  ];
  let size = "";
  let color = "";
  const unused: string[] = [];
  for (const [tipo, nome] of pairs) {
    if (!nome) continue;
    const kind = tipo.toLowerCase();
    if (kind.includes("tamanh") || kind.includes("size") || kind === "tam") {
      size = size || nome;
    } else if (kind.includes("cor") || kind.includes("color")) {
      color = color || nome;
    } else {
      unused.push(nome);
    }
  }
  for (const nome of unused) {
    if (!color) color = nome;
    else if (!size) size = nome;
  }
  return { size, color };
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
      "quantidadeEmEstoque",
      "quantidadeEstoque",
      "estoqueAtual",
      "estoque",
      "saldo",
      "quantidade",
      "stock",
    ]) ??
    (fallback
      ? firstNumber(fallback, ["quantidadeEmEstoque", "quantidadeEstoque", "estoque", "saldo"])
      : null);
  const minStock =
    firstNumber(record, [
      "quantidadeMinimaEmEstoque",
      "quantidadeMinima",
      "estoqueMinimo",
      "estoque_minimo",
      "minimo",
    ]) ??
    (fallback
      ? firstNumber(fallback, ["quantidadeMinimaEmEstoque", "quantidadeMinima", "estoqueMinimo"])
      : null) ??
    0;
  const price =
    firstNumber(record, ["preco", "precoVenda", "valor", "price"]) ??
    (fallback ? firstNumber(fallback, ["preco", "precoVenda", "valor"]) : null) ??
    0;
  const axes = variationAxes(record);
  const size =
    firstString(record, ["tamanho", "size", "tam"]) ||
    axes.size ||
    (fallback ? firstString(fallback, ["tamanho"]) : "") ||
    "—";
  const color =
    firstString(record, ["cor", "color"]) ||
    axes.color ||
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
