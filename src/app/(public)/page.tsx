import { Hero } from "@/components/home/hero";
import { FeaturedProducts } from "@/components/home/featured-products";
import { CategoriesSection } from "@/components/home/categories-section";
import { StorySection } from "@/components/home/story-section";
import { Testimonials } from "@/components/home/testimonials";
import { CTASection } from "@/components/home/cta-section";
import { getFeaturedProducts, getCategories, getApprovedTestimonials } from "@/lib/data";

export const revalidate = 60; // revalidate every 60 seconds

export default async function Home() {
  const [products, categories, testimonials] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
    getApprovedTestimonials(6),
  ]);

  return (
    <>
      <Hero />
      <FeaturedProducts products={products} />
      <CategoriesSection categories={categories} />
      <StorySection />
      <Testimonials testimonials={testimonials} />
      <CTASection />
    </>
  );
}
