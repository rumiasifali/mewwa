"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/shared/motion";
import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";

export function FeaturedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Our Collection
            </p>
            <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
              Featured Products
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Handpicked favourites loved by our customers — each sourced from
              its finest origin.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-full shrink-0">
            <Link href="/products">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </AnimatedSection>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
