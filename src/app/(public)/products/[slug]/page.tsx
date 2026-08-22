import { notFound } from "next/navigation";
import {
  getProductBySlug,
  getRelatedProducts,
  getProductTestimonials,
} from "@/lib/data";
import { ProductDetail } from "@/components/products/product-detail";

export const revalidate = 60;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const [related, testimonials] = await Promise.all([
    getRelatedProducts(product.category_id, product.id),
    getProductTestimonials(product.id),
  ]);

  return (
    <ProductDetail
      product={product}
      related={related}
      testimonials={testimonials}
    />
  );
}
