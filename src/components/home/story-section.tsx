"use client";

import { AnimatedSection, slideInLeft, slideInRight } from "@/components/shared/motion";
import { Shield, Leaf, Truck, Award } from "lucide-react";

const values = [
  {
    icon: Leaf,
    title: "100% Natural",
    description: "No preservatives, no additives, no artificial colours. Just pure, honest dry fruits.",
  },
  {
    icon: Shield,
    title: "Quality Assured",
    description: "Every batch is checked for freshness, taste, and grade before packing.",
  },
  {
    icon: Truck,
    title: "Nationwide + Global",
    description: "We ship across Pakistan and internationally to bring quality to your doorstep.",
  },
  {
    icon: Award,
    title: "Sourced with Care",
    description: "Direct from orchards in Afghanistan, Iran, Hunza, and Gilgit-Baltistan.",
  },
];

export function StorySection() {
  return (
    <section className="py-24 sm:py-32 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left — Story */}
          <AnimatedSection variants={slideInLeft}>
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              Our Story
            </p>
            <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-tight">
              Not Just Dry Fruits.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600">
                A Promise of Quality.
              </span>
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                We started with a simple belief: everyone deserves access to
                genuinely premium dry fruits — not the mass-produced, stale
                variety you find in most stores.
              </p>
              <p>
                Every product we sell is handpicked, freshly packed, and sourced
                directly from trusted growers in the mountains of northern
                Pakistan, the orchards of Afghanistan, and the pistachio farms
                of Iran.
              </p>
              <p>
                When you open a QAAQ package, you&apos;ll taste the difference
                immediately. That&apos;s our promise.
              </p>
            </div>
          </AnimatedSection>

          {/* Right — Values Grid */}
          <AnimatedSection variants={slideInRight}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {values.map((value, i) => (
                <div
                  key={value.title}
                  className="group p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg hover:shadow-amber-900/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                    <value.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground">{value.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
