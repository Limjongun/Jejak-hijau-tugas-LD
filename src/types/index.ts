export type Role = "CUSTOMER" | "ADMIN";

export type ProductStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | "EXPIRED"
  | "REFUNDED";

export interface Sdg {
  id: number;
  name: string;
  color: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  weightGram: number;
  status: ProductStatus;
  isFeatured: boolean;
  co2SavedKg: number; // estimasi CO2 dihemat per unit/tahun
  plasticSavedPcs: number; // estimasi botol/sampah plastik dihemat
  impactNote: string;
  avgRating: number;
  reviewCount: number;
  soldCount: number;
  categoryId: string;
  category?: Category;
  images: string[];
  sdgIds: number[];
  sdgs?: Sdg[];
  origin?: string;
  materials?: string;
  createdAt?: string;
}

export interface CartItem {
  productId: string;
  product: Product;
  quantity: number;
}

export interface EcoImpactCalculation {
  co2Kg: number;
  plasticPcs: number;
  treeEquivalent: number;
  motorKmEquivalent: number;
}

export interface EcoBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  requiredMetric: string;
  unlocked?: boolean;
}

export interface TreeDonation {
  id: string;
  treeCount: number;
  treeType: string;
  location: string;
  plantedAt?: string;
  proofImageUrl?: string;
  status: "PENDING" | "PLANTED";
}
