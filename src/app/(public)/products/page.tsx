import { Suspense } from "react";
import { getProducts, getCategories } from "@/lib/data";
import { ProductsGrid } from "@/components/products/products-grid";

export const revalidate = 60;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <Suspense>
      <ProductsGrid products={products} categories={categories} />
    </Suspense>
  );
}
