export type WindowDays = 7 | 30 | 90;

export type StockSituation = "todos" | "risco" | "divergente" | "sem-par";

export type MovementFilter = "todos" | "entradas" | "saidas" | "cancelados";

export type ViewFilters = {
  windowDays: WindowDays;
  coverTarget: number;
  query: string;
  situation: StockSituation;
  movement: MovementFilter;
};

const WINDOW_DAYS: readonly WindowDays[] = [7, 30, 90];

export function isWindowDays(value: number): value is WindowDays {
  return WINDOW_DAYS.some((days) => days === value);
}

export function windowLabel(days: WindowDays): string {
  switch (days) {
    case 7:
      return "7 dias";
    case 30:
      return "30 dias";
    case 90:
      return "90 dias";
    default: {
      const exhaustive: never = days;
      return exhaustive;
    }
  }
}

export function situationLabel(situation: StockSituation): string {
  switch (situation) {
    case "todos":
      return "Todos";
    case "risco":
      return "Em risco";
    case "divergente":
      return "Divergentes";
    case "sem-par":
      return "Sem par";
    default: {
      const exhaustive: never = situation;
      return exhaustive;
    }
  }
}

export function movementFilterLabel(filter: MovementFilter): string {
  switch (filter) {
    case "todos":
      return "Todos";
    case "entradas":
      return "Entradas";
    case "saidas":
      return "Saídas";
    case "cancelados":
      return "Cancelados";
    default: {
      const exhaustive: never = filter;
      return exhaustive;
    }
  }
}

function firstParam(
  params: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = params[key];
  if (Array.isArray(value)) return value[0];
  return value;
}

function parseSituation(value: string | undefined): StockSituation {
  switch (value) {
    case "risco":
    case "divergente":
    case "sem-par":
    case "todos":
      return value;
    default:
      return "todos";
  }
}

function parseMovement(value: string | undefined): MovementFilter {
  switch (value) {
    case "entradas":
    case "saidas":
    case "cancelados":
    case "todos":
      return value;
    default:
      return "todos";
  }
}

export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): ViewFilters {
  const windowRaw = Number(firstParam(params, "janela"));
  const coverRaw = Number(firstParam(params, "cobertura"));
  const coverTarget = Number.isFinite(coverRaw)
    ? Math.min(120, Math.max(7, Math.round(coverRaw)))
    : 30;
  return {
    windowDays: isWindowDays(windowRaw) ? windowRaw : 30,
    coverTarget,
    query: (firstParam(params, "q") ?? "").trim(),
    situation: parseSituation(firstParam(params, "situacao")),
    movement: parseMovement(firstParam(params, "tipo")),
  };
}

export const COVER_CHOICES = [15, 30, 45, 60] as const;
export const WINDOW_CHOICES = WINDOW_DAYS;
