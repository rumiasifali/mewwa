import type { WeightOption } from "@/types";

/**
 * Finds the catalog weight variant matching a requested gram size.
 * Cart/order prices must always come from here (the products table),
 * never from client input.
 */
export function findWeightVariant(
  weights: unknown,
  weightGrams: number
): WeightOption | null {
  if (!Array.isArray(weights)) return null;
  const match = (weights as WeightOption[]).find(
    (w) =>
      w &&
      typeof w === "object" &&
      Number(w.grams) === weightGrams &&
      typeof w.price === "number" &&
      w.price >= 0
  );
  return match ?? null;
}

/** Validates a cart quantity: integer within [1, 10]. */
export function isValidQuantity(quantity: unknown): quantity is number {
  return (
    typeof quantity === "number" &&
    Number.isInteger(quantity) &&
    quantity >= 1 &&
    quantity <= 10
  );
}
