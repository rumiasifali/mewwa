"use client";

import Link from "next/link";
import { AnimatedSection, motion, staggerContainer, fadeUp } from "@/components/shared/motion";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";

const categoryEmojis: Record<string, string> = {
  nuts: "🌰",
  "dried-fruits": "🍑",
  seeds: "🌻",
  "gift-boxes": "🎁",
};

export function CategoriesSection({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            Browse By
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Categories
          </h2>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {categories.map((cat, i) => (
            <motion.div key={cat.id} variants={fadeUp} custom={i}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-950/30 dark:to-stone-900"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-8xl sm:text-9xl opacity-20 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6">
                    {categoryEmojis[cat.slug] || "🥜"}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute inset-0 p-5 sm:p-6 flex flex-col justify-end">
                  <h3 className="text-white font-semibold text-lg sm:text-xl">
                    {cat.name}
                  </h3>
                  <p className="text-white/60 text-sm mt-1 line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="mt-3 flex items-center gap-1 text-white/80 text-sm font-medium group-hover:text-white transition-colors">
                    Explore
                    <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
