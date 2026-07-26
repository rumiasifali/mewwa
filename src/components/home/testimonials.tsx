"use client";

import { AnimatedSection, motion, staggerContainer, fadeUp } from "@/components/shared/motion";
import { Star } from "lucide-react";
import Link from "next/link";
import type { Testimonial } from "@/types";

export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-24 sm:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            What People Say
          </p>
          <h2 className="mt-2 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Loved by Customers
          </h2>
        </AnimatedSection>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {testimonials.slice(0, 3).map((t, i) => (
            <motion.div
              key={t.id}
              variants={fadeUp}
              custom={i}
              className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50"
            >
              {/* Stars */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="mt-4 text-foreground leading-relaxed">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {t.name[0]}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.location}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA to leave feedback */}
        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Have you tried QAAQ? We'd love to hear your feedback!</p>
          <Link
            href="/feedback"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors"
          >
            Leave Your Review
          </Link>
        </div>
      </div>
    </section>
  );
}
