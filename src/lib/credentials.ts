export type Credentials = {
  hiperKey: string;
  hiperBaseUrl: string;
  hiperProductsPath: string;
  nuvemshopToken: string;
  nuvemshopStoreId: string;
  nuvemshopVersion: string;
  nuvemshopUserAgent: string;
  complete: boolean;
  missing: string[];
};

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? "";
}

export function readCredentials(): Credentials {
  const hiperKey = readEnv("HIPER_API_KEY");
  const nuvemshopToken = readEnv("NUVEMSHOP_ACCESS_TOKEN");
  const nuvemshopStoreId = readEnv("NUVEMSHOP_STORE_ID");
  const missing: string[] = [];
  if (!hiperKey) missing.push("HIPER_API_KEY");
  if (!nuvemshopToken) missing.push("NUVEMSHOP_ACCESS_TOKEN");
  if (!nuvemshopStoreId) missing.push("NUVEMSHOP_STORE_ID");
  return {
    hiperKey,
    hiperBaseUrl: readEnv("HIPER_API_BASE_URL") || "https://ecommerce.hiper.com.br",
    hiperProductsPath: readEnv("HIPER_PRODUCTS_PATH") || "/api/produtos",
    nuvemshopToken,
    nuvemshopStoreId,
    nuvemshopVersion: readEnv("NUVEMSHOP_API_VERSION") || "2025-03",
    nuvemshopUserAgent:
      readEnv("NUVEMSHOP_USER_AGENT") || "LUNIE (estoque@lunie.local)",
    complete: missing.length === 0,
    missing,
  };
}
