import { Hero } from "@/components/home/hero";
import { OriginTicker } from "@/components/home/origin-ticker";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoriesSection } from "@/components/home/categories-section";
import { ProofBand } from "@/components/home/proof-band";
import { StorySection } from "@/components/home/story-section";
import { PackedToOrder } from "@/components/home/packed-to-order";
import { Testimonials } from "@/components/home/testimonials";
import { CTASection } from "@/components/home/cta-section";
import { JournalSection } from "@/components/home/journal-section";
import { getFeaturedProducts, getCategories, getApprovedTestimonials, getPosts } from "@/lib/data";

export const revalidate = 60;

export default async function Home() {
  const [products, categories, testimonials, posts] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getApprovedTestimonials(6),
    getPosts(),
  ]);

  return (
    <>
      <Hero todaysPick={products[0] || null} />
      <OriginTicker />
      <FeaturedProducts products={products} />
      <CategoriesSection categories={categories} />
      <ProofBand />
      <StorySection />
      <PackedToOrder />
      <Testimonials testimonials={testimonials} />
      <JournalSection posts={posts.slice(0, 3)} />
      <CTASection />
    </>
  );
}
