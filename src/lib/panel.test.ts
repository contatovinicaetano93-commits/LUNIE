import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { analyze, suggestedBuy } from "./analytics";
import { DEMO_BARCODES, buildDemoSnapshot } from "./demo";
import { mergeProducts } from "./merge";
import { normalizeHiperProduct } from "./sources/hiper";
import { normalizeNuvemshopOrder, paymentState } from "./sources/nuvemshop";
import type { ManualMovement, SourceVariant } from "./types";

const now = new Date("2026-10-14T15:00:00.000Z");

describe("reposição", () => {
  it("sugere a velocidade vezes a cobertura menos o saldo", () => {
    assert.equal(suggestedBuy(18, 30, 30, 1), 17);
    assert.equal(suggestedBuy(0, 30, 30, 4), 0);
    assert.equal(suggestedBuy(2, 30, 30, 10), 0);
  });

  it("a amostra deixa o M do vestido curto e o GG parado", () => {
    const snapshot = buildDemoSnapshot(now);
    const analysis = analyze({
      snapshot,
      movements: [],
      windowDays: 30,
      coverTarget: 30,
      now,
    });
    const vestidoM = analysis.variants.find(
      (variant) => variant.barcode === DEMO_BARCODES.vestidoAreiaM,
    );
    const vestidoGg = analysis.variants.find(
      (variant) => variant.barcode === DEMO_BARCODES.vestidoAreiaGg,
    );
    assert.ok(vestidoM);
    assert.equal(vestidoM.unitsSold, 18);
    assert.equal(vestidoM.suggested, 17);
    assert.equal(vestidoM.atRisk, true);
    assert.ok(vestidoGg);
    assert.equal(vestidoGg.unitsSold, 0);
    assert.equal(vestidoGg.planningStock, 14);
    const grade = analysis.insights.find(
      (insight) =>
        insight.kind === "grade" && insight.title.includes("Vestido Linho Luna"),
    );
    assert.ok(grade);
    assert.match(grade.detail, /M tem/);
    assert.match(grade.detail, /GG tem/);
  });

  it("uma entrada local reduz a compra sugerida", () => {
    const snapshot = buildDemoSnapshot(now);
    const movement: ManualMovement = {
      id: "entrada-1",
      scope: "demo",
      createdAt: now.toISOString(),
      barcode: DEMO_BARCODES.vestidoAreiaM,
      kind: "entrada",
      quantity: 10,
      note: "Recebimento",
    };
    const analysis = analyze({
      snapshot,
      movements: [movement],
      windowDays: 30,
      coverTarget: 30,
      now,
    });
    const vestidoM = analysis.variants.find(
      (variant) => variant.barcode === DEMO_BARCODES.vestidoAreiaM,
    );
    assert.ok(vestidoM);
    assert.equal(vestidoM.planningStock, 11);
    assert.equal(vestidoM.suggested, 7);
  });

  it("pedido cancelado não entra na velocidade", () => {
    const snapshot = buildDemoSnapshot(now);
    const cancelled = snapshot.sales.filter(
      (sale) =>
        sale.barcode === DEMO_BARCODES.vestidoAreiaM && sale.payment === "cancelado",
    );
    assert.equal(cancelled.length, 1);
    const analysis = analyze({
      snapshot,
      movements: [],
      windowDays: 30,
      coverTarget: 30,
      now,
    });
    const vestidoM = analysis.variants.find(
      (variant) => variant.barcode === DEMO_BARCODES.vestidoAreiaM,
    );
    assert.equal(vestidoM?.unitsSold, 18);
  });
});

describe("cruzamento", () => {
  it("une Hiper e Nuvemshop pelo código e aponta saldo diferente", () => {
    const hiper = variant("hiper", "10", "Vestido", "789", 8);
    const nuvem = variant("nuvemshop", "20", "Vestido loja", "789", 2);
    const { products, warnings } = mergeProducts([hiper], [nuvem]);
    assert.equal(warnings.length, 0);
    assert.equal(products.length, 1);
    const merged = products[0]?.variants[0];
    assert.ok(merged);
    assert.equal(merged.productName, "Vestido");
    assert.equal(merged.hiperStock, 8);
    assert.equal(merged.nuvemshopStock, 2);
    assert.equal(merged.onHiper, true);
    assert.equal(merged.onNuvemshop, true);
  });

  it("mantém variante que existe em só um lado", () => {
    const onlyHiper = variant("hiper", "1", "Cinto", "111", 12);
    const onlyShop = variant("nuvemshop", "2", "Brinco", "222", 4);
    const { products } = mergeProducts([onlyHiper], [onlyShop]);
    assert.equal(products.length, 2);
  });

  it("lê grade do Hiper e ignora produto inativo", () => {
    const rows = normalizeHiperProduct({
      id: 9,
      nome: "Saia",
      categoria: "Saias",
      situacao: "ativo",
      grades: [
        { id: 1, codigoDeBarras: "555", tamanho: "P", cor: "Preto", estoque: 3, preco: 100 },
        { id: 2, codigoDeBarras: "556", tamanho: "M", cor: "Preto", estoque: 1, preco: 100 },
      ],
    });
    assert.equal(rows.length, 2);
    assert.equal(rows[0]?.barcode, "555");
    assert.equal(rows[0]?.size, "P");
    const inactive = normalizeHiperProduct({
      id: 3,
      nome: "Fora",
      situacao: "inativo",
      codigoDeBarras: "000",
      estoque: 4,
    });
    assert.equal(inactive.length, 0);
  });

  it("lê a grade oficial do Hiper e ignora variação inativa", () => {
    const rows = normalizeHiperProduct({
      id: "parent",
      nome: "Vestido",
      categoria: "Vestidos",
      marca: "LUNIE",
      ativo: true,
      removido: false,
      preco: 790,
      variacao: [
        {
          id: "a",
          codigoDeBarras: "789",
          tipoVariacaoA: "Tamanhos",
          nomeVariacaoA: "M",
          tipoVariacaoB: "Cores",
          nomeVariacaoB: "Areia",
          quantidadeEmEstoque: 2,
          quantidadeMinimaEmEstoque: 1,
          variacaoAtiva: true,
        },
        {
          id: "b",
          codigoDeBarras: "790",
          tipoVariacaoA: "Tamanhos",
          nomeVariacaoA: "P",
          quantidadeEmEstoque: 9,
          variacaoAtiva: false,
        },
      ],
    });
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.barcode, "789");
    assert.equal(rows[0]?.size, "M");
    assert.equal(rows[0]?.color, "Areia");
    assert.equal(rows[0]?.stock, 2);
    assert.equal(rows[0]?.minStock, 1);
    assert.equal(rows[0]?.price, 790);
    const removed = normalizeHiperProduct({
      id: "x",
      nome: "Fora",
      ativo: false,
      codigoDeBarras: "1",
      quantidadeEmEstoque: 3,
    });
    assert.equal(removed.length, 0);
  });
});

describe("pedidos da Nuvemshop", () => {
  it("classifica pagamento", () => {
    assert.equal(paymentState("open", "paid"), "pago");
    assert.equal(paymentState("cancelled", "paid"), "cancelado");
    assert.equal(paymentState("open", "pending"), "pendente");
  });

  it("extrai sku, quantidade e valor", () => {
    const sales = normalizeNuvemshopOrder({
      id: 10,
      number: 501,
      status: "open",
      payment_status: "paid",
      created_at: "2026-10-01T12:00:00.000Z",
      products: [
        {
          name: { pt: "Vestido" },
          sku: "789",
          quantity: 2,
          price: "790.00",
          variant_values: ["Areia", "M"],
        },
      ],
    });
    assert.equal(sales.length, 1);
    assert.equal(sales[0]?.barcode, "789");
    assert.equal(sales[0]?.quantity, 2);
    assert.equal(sales[0]?.unitPrice, 790);
    assert.equal(sales[0]?.payment, "pago");
    assert.equal(sales[0]?.orderId, "501");
  });
});

function variant(
  source: SourceVariant["source"],
  productId: string,
  productName: string,
  barcode: string,
  stock: number,
): SourceVariant {
  return {
    source,
    productName,
    category: "Vestidos",
    brand: "LUNIE",
    barcode,
    size: "M",
    color: "Areia",
    stock,
    minStock: 2,
    price: 100,
    productId,
    variantId: `${productId}-1`,
  };
}
