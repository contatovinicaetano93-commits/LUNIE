import type { MovementKind, PairStatus, PaymentState } from "@/lib/types";

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function formatBRL(value: number): string {
  return brl.format(value);
}

export function formatNumber(value: number): string {
  return integer.format(value);
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return dateTime.format(date);
}

export function formatCover(days: number | null): string {
  if (days === null) return "sem giro";
  if (days <= 0) return "0 dias";
  if (days > 365) return "mais de um ano";
  const rounded = Math.round(days);
  return rounded === 1 ? "1 dia" : `${formatNumber(rounded)} dias`;
}

export function pairLabel(pair: PairStatus): string {
  switch (pair) {
    case "pareado":
      return "Pareado";
    case "somente-hiper":
      return "Só no Hiper";
    case "somente-nuvemshop":
      return "Só na Nuvemshop";
    case "sem-codigo":
      return "Sem código";
    default: {
      const exhaustive: never = pair;
      return exhaustive;
    }
  }
}

export function movementLabel(kind: MovementKind): string {
  switch (kind) {
    case "entrada":
      return "Entrada";
    case "saida":
      return "Saída";
    default: {
      const exhaustive: never = kind;
      return exhaustive;
    }
  }
}

export function paymentLabel(payment: PaymentState): string {
  switch (payment) {
    case "pago":
      return "Pago";
    case "cancelado":
      return "Cancelado";
    case "pendente":
      return "Pendente";
    default: {
      const exhaustive: never = payment;
      return exhaustive;
    }
  }
}

export function slug(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return normalized || "item";
}
