"use client";

import { AnimatedSection, slideInLeft, slideInRight, fadeUp, staggerContainer, motion } from "@/components/shared/motion";
import { Mountain, Heart, Globe, Users } from "lucide-react";

const milestones = [
  {
    icon: Mountain,
    title: "Sourced from the Best",
    description:
      "We work directly with growers in Gilgit-Baltistan, Hunza, Afghanistan, and Iran — cutting out middlemen to bring you the freshest products at honest prices.",
  },
  {
    icon: Heart,
    title: "Packed with Care",
    description:
      "Every order is freshly packed in our own premium packaging, designed to preserve flavor and freshness from our hands to yours.",
  },
  {
    icon: Globe,
    title: "Delivered Everywhere",
    description:
      "Whether you're in Lahore or London, we ship nationwide across Pakistan and internationally to bring a taste of home wherever you are.",
  },
  {
    icon: Users,
    title: "Built on Trust",
    description:
      "We believe in transparency — real product photos, honest descriptions, and weight you can verify. No surprises, just quality.",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-24 sm:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="max-w-3xl">
          <AnimatedSection>
            <p className="text-sm font-medium text-primary uppercase tracking-wider">
              About QAAQ
            </p>
            <h1 className="mt-3 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              We Believe Everyone
              <br />
              Deserves{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600">
                Real Quality
              </span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-2xl">
              QAAQ was born from a simple frustration — the dry fruits available
              in most stores are stale, overpriced, and you never know what
              you&apos;re really getting. We decided to change that.
            </p>
          </AnimatedSection>
        </div>

        {/* Story */}
        <div className="mt-20 grid lg:grid-cols-2 gap-16 items-center">
          <AnimatedSection variants={slideInLeft}>
            <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-950/20 dark:to-stone-900 flex items-center justify-center">
              <span className="text-[100px] opacity-30">🏔️</span>
            </div>
          </AnimatedSection>
          <AnimatedSection variants={slideInRight}>
            <h2 className="text-3xl font-bold tracking-tight">Our Story</h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>
                It started at a family gathering. Someone brought dry fruits
                from a well-known brand — they looked premium but tasted
                anything but. Stale cashews, bitter almonds, and raisins that
                had clearly been sitting on a shelf for months.
              </p>
              <p>
                We knew we could do better. Having grown up around the dry fruit
                trade, we had the connections — farmers in Hunza who grow the
                world&apos;s best apricots, suppliers in Afghanistan with access
                to the finest Mamra almonds, importers who bring in the real
                Iranian pistachios.
              </p>
              <p>
                So we started QAAQ. Not as a giant operation, but as a focused,
                quality-first brand. Every product we sell is one we&apos;d
                proudly serve our own family. That&apos;s the standard.
              </p>
            </div>
          </AnimatedSection>
        </div>

        {/* Values */}
        <div className="mt-32">
          <AnimatedSection className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              What Drives Us
            </h2>
          </AnimatedSection>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {milestones.map((m, i) => (
              <motion.div
                key={m.title}
                variants={fadeUp}
                custom={i}
                className="p-6 rounded-2xl bg-card border border-border/50 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <m.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-lg">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  {m.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
