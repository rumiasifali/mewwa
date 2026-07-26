import { Hero } from "@/components/home/hero";
import { OriginTicker } from "@/components/home/origin-ticker";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProofBand } from "@/components/home/proof-band";
import { StorySection } from "@/components/home/story-section";
import { PackedToOrder } from "@/components/home/packed-to-order";
import { Testimonials } from "@/components/home/testimonials";
import { CTASection } from "@/components/home/cta-section";
import { getFeaturedProducts, getCategories, getApprovedTestimonials } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [products, categories, testimonials] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getApprovedTestimonials(6),
  ]);

  return (
    <>
      <Hero />
      <OriginTicker />
      <FeaturedProducts products={products} />
      <CategoriesSection categories={categories} />
      <ProofBand />
      <StorySection />
      <PackedToOrder />
      <Testimonials testimonials={testimonials} />
      <CTASection />
    </>
  );
}
