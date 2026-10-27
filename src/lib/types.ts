export type DataMode = "live";

export type PaymentState = "pago" | "cancelado" | "pendente";

export type MovementKind = "entrada" | "saida";

export type PairStatus =
  | "pareado"
  | "somente-hiper"
  | "somente-nuvemshop"
  | "sem-codigo";

export type CatalogVariant = {
  id: string;
  productId: string;
  productName: string;
  category: string;
  brand: string;
  barcode: string;
  size: string;
  color: string;
  price: number;
  minStock: number;
  hiperStock: number | null;
  nuvemshopStock: number | null;
  onHiper: boolean;
  onNuvemshop: boolean;
  hiperProductId: string | null;
  nuvemshopProductId: string | null;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  brand: string;
  variants: CatalogVariant[];
};

export type SaleLine = {
  id: string;
  orderId: string;
  createdAt: string;
  barcode: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  payment: PaymentState;
};

export type Snapshot = {
  mode: DataMode;
  syncedAt: string;
  products: Product[];
  sales: SaleLine[];
  warnings: string[];
};

export type ManualMovement = {
  id: string;
  scope: DataMode;
  createdAt: string;
  barcode: string;
  kind: MovementKind;
  quantity: number;
  note: string;
};

export type SourceVariant = {
  source: "hiper" | "nuvemshop";
  productName: string;
  category: string;
  brand: string;
  barcode: string;
  size: string;
  color: string;
  stock: number | null;
  minStock: number;
  price: number;
  productId: string;
  variantId: string;
};

export type RawSale = {
  orderId: string;
  createdAt: string;
  barcode: string;
  productName: string;
  size: string;
  color: string;
  quantity: number;
  unitPrice: number;
  payment: PaymentState;
};
