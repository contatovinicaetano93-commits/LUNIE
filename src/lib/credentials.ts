export type Credentials = {
  hiperKey: string;
  hiperBaseUrl: string;
  nuvemshopToken: string;
  nuvemshopStoreId: string;
  nuvemshopVersion: string;
  nuvemshopUserAgent: string;
  hiperReady: boolean;
  nuvemshopReady: boolean;
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
  const hiperReady = hiperKey.length > 0;
  const nuvemshopReady = nuvemshopToken.length > 0 && nuvemshopStoreId.length > 0;
  return {
    hiperKey,
    hiperBaseUrl: readEnv("HIPER_API_BASE_URL") || "https://ms-ecommerce.hiper.com.br",
    nuvemshopToken,
    nuvemshopStoreId,
    nuvemshopVersion: readEnv("NUVEMSHOP_API_VERSION") || "2025-03",
    nuvemshopUserAgent:
      readEnv("NUVEMSHOP_USER_AGENT") || "LUNIE (estoque@lunie.local)",
    hiperReady,
    nuvemshopReady,
    complete: missing.length === 0,
    missing,
  };
}
