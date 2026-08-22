import { describe, it, expect } from "vitest";
import { findWeightVariant, isValidQuantity } from "@/lib/cart-pricing";

const WEIGHTS = [
  { grams: 250, label: "250g", price: 850, currency: "PKR" },
  { grams: 500, label: "500g", price: 1600, currency: "PKR" },
  { grams: 1000, label: "1kg", price: 3000, currency: "PKR" },
];

describe("findWeightVariant", () => {
  it("finds the matching catalog variant", () => {
    const v = findWeightVariant(WEIGHTS, 500);
    expect(v).not.toBeNull();
    expect(v!.price).toBe(1600);
    expect(v!.label).toBe("500g");
  });

  it("returns null for a weight not in the catalog", () => {
    expect(findWeightVariant(WEIGHTS, 750)).toBeNull();
  });

  it("returns null for malformed weights payloads", () => {
    expect(findWeightVariant(null, 250)).toBeNull();
    expect(findWeightVariant("garbage", 250)).toBeNull();
    expect(findWeightVariant([{ grams: 250 }], 250)).toBeNull(); // no price
    expect(
      findWeightVariant([{ grams: 250, label: "250g", price: -5 }], 250)
    ).toBeNull(); // negative price rejected
  });
});

describe("isValidQuantity", () => {
  it("accepts integers 1..10", () => {
    expect(isValidQuantity(1)).toBe(true);
    expect(isValidQuantity(10)).toBe(true);
  });

  it("rejects everything else", () => {
    expect(isValidQuantity(0)).toBe(false);
    expect(isValidQuantity(11)).toBe(false);
    expect(isValidQuantity(-1)).toBe(false);
    expect(isValidQuantity(2.5)).toBe(false);
    expect(isValidQuantity("3")).toBe(false);
    expect(isValidQuantity(null)).toBe(false);
    expect(isValidQuantity(NaN)).toBe(false);
  });
});
