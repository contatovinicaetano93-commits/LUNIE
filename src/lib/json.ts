export function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

export function asString(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return "";
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) return null;
    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

export function localizedText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  const record = asRecord(value);
  if (!record) return "";
  for (const key of ["pt", "pt-BR", "pt_BR", "es", "en"]) {
    const entry = record[key];
    if (typeof entry === "string" && entry.trim()) return entry.trim();
  }
  for (const entry of Object.values(record)) {
    if (typeof entry === "string" && entry.trim()) return entry.trim();
  }
  return "";
}

export function firstString(
  record: Record<string, unknown>,
  keys: readonly string[],
): string {
  for (const key of keys) {
    const text = asString(record[key]);
    if (text) return text;
  }
  return "";
}

export function firstNumber(
  record: Record<string, unknown>,
  keys: readonly string[],
): number | null {
  for (const key of keys) {
    const parsed = asNumber(record[key]);
    if (parsed !== null) return parsed;
  }
  return null;
}
