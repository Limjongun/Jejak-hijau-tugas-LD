import { CartItem, EcoImpactCalculation } from "@/types";

/**
 * Menghitung akumulasi dampak lingkungan dari kumpulan item
 */
export function calculateImpact(items: CartItem[]): EcoImpactCalculation {
  const result = items.reduce(
    (acc, item) => ({
      co2Kg: acc.co2Kg + (item.product.co2SavedKg || 0) * item.quantity,
      plasticPcs:
        acc.plasticPcs + (item.product.plasticSavedPcs || 0) * item.quantity,
    }),
    { co2Kg: 0, plasticPcs: 0 }
  );

  // 1 pohon dewasa menyerap rata-rata 20 kg CO2 per tahun
  const treeEquivalent = Number((result.co2Kg / 20).toFixed(1));

  // Rata-rata sepeda motor bensin menghasilkan ~0.1 kg CO2 per kilometer
  const motorKmEquivalent = Math.round(result.co2Kg / 0.1);

  return {
    co2Kg: Number(result.co2Kg.toFixed(2)),
    plasticPcs: Math.round(result.plasticPcs),
    treeEquivalent,
    motorKmEquivalent,
  };
}

/**
 * Menghitung perolehan Eco Points
 * Aturan: 1 poin per Rp1.000 belanja + bonus opsi kemasan tanpa plastik (+10 poin)
 */
export function calculateEcoPoints(
  subtotal: number,
  options: { isPlasticFreePackage?: boolean; isReviewBonus?: boolean } = {}
): number {
  const basePoints = Math.floor(subtotal / 1000);
  const packagingBonus = options.isPlasticFreePackage ? 10 : 0;
  const reviewBonus = options.isReviewBonus ? 5 : 0;

  return basePoints + packagingBonus + reviewBonus;
}

/**
 * Konversi Eco Points menjadi potongan rupiah
 * 100 poin = Rp1.000 diskon (maksimum 30% dari subtotal)
 */
export function calculatePointDiscount(
  points: number,
  subtotal: number
): { discountRupiah: number; pointsUsed: number } {
  const maxDiscountAllowed = Math.floor(subtotal * 0.3);
  const requestedDiscount = Math.floor(points / 100) * 1000;

  const discountRupiah = Math.min(requestedDiscount, maxDiscountAllowed);
  const pointsUsed = (discountRupiah / 1000) * 100;

  return {
    discountRupiah,
    pointsUsed,
  };
}

export const TREE_DONATION_POINTS = 500; // 500 Eco Points = 1 bibit pohon
