"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MessageCircle,
  Shield,
  Truck,
  Leaf,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatPrice, getWhatsAppLink } from "@/lib/constants";
import { motion } from "@/components/shared/motion";
import { AnimatedSection } from "@/components/shared/motion";
import type { Product } from "@/types";

const categoryEmoji: Record<string, string> = {
  nuts: "🥜",
  "dried-fruits": "🍑",
  seeds: "🌻",
  "gift-boxes": "🎁",
};

export function ProductDetail({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [selectedWeight, setSelectedWeight] = useState(0);
  const currentWeight = product.weights[selectedWeight];

  return (
    <div className="pt-24 sm:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
        >
          <Link href="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href="/products"
            className="hover:text-foreground transition-colors"
          >
            Products
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-medium">{product.name}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left — Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative aspect-square overflow-hidden rounded-3xl bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-stone-900">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-[120px] sm:text-[180px] opacity-30">
                    {categoryEmoji[product.category] || "🥜"}
                  </span>
                </div>
              )}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.tags.includes("bestseller") && (
                  <Badge className="bg-amber-500 text-white border-0">
                    Bestseller
                  </Badge>
                )}
                {product.tags.includes("rare") && (
                  <Badge className="bg-rose-500 text-white border-0">
                    Rare Find
                  </Badge>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right — Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col"
          >
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider">
                {product.origin}
              </p>
              <h1 className="mt-2 text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {product.name}
              </h1>
            </div>

            <p className="mt-4 text-muted-foreground leading-relaxed">
              {product.description}
            </p>

            <Separator className="my-6" />

            {/* Weight Selection */}
            {product.weights.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground">
                  Select Weight
                </label>
                <div className="mt-3 flex flex-wrap gap-3">
                  {product.weights.map((w, i) => (
                    <button
                      key={w.grams}
                      onClick={() => setSelectedWeight(i)}
                      className={`px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 border ${
                        i === selectedWeight
                          ? "bg-primary text-primary-foreground border-primary shadow-sm"
                          : "bg-card text-foreground border-border hover:border-primary/30 hover:bg-accent"
                      }`}
                    >
                      {w.label}
                      <span className="block text-xs mt-0.5 opacity-70">
                        {formatPrice(w.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            {currentWeight && (
              <div className="mt-6">
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(currentWeight.price)}
                </span>
                <span className="text-sm text-muted-foreground ml-2">
                  for {currentWeight.label}
                </span>
              </div>
            )}

            {/* CTA */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                size="lg"
                className="rounded-full bg-green-600 hover:bg-green-700 text-white text-base px-8 h-14 font-semibold flex-1 sm:flex-none"
              >
                <a
                  href={getWhatsAppLink(product, currentWeight?.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Order on WhatsApp
                </a>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-full text-base px-8 h-14"
              >
                <Link href="/contact">Inquire</Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              {[
                { icon: Leaf, label: "100% Natural" },
                { icon: Shield, label: "Quality Assured" },
                { icon: Truck, label: "Fast Delivery" },
              ].map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/50 text-center"
                >
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-medium text-muted-foreground">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="nutrition" className="mt-8">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-secondary h-11">
                <TabsTrigger value="nutrition" className="rounded-lg text-xs sm:text-sm">
                  Nutrition
                </TabsTrigger>
                <TabsTrigger value="storage" className="rounded-lg text-xs sm:text-sm">
                  Storage
                </TabsTrigger>
                <TabsTrigger value="shipping" className="rounded-lg text-xs sm:text-sm">
                  Shipping
                </TabsTrigger>
              </TabsList>
              <TabsContent value="nutrition" className="mt-4">
                <div className="rounded-xl bg-secondary/30 p-5 space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Per {product.nutrition?.serving_size || "serving"}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: "Calories", value: `${product.nutrition?.calories || 0} kcal` },
                      { label: "Protein", value: product.nutrition?.protein || "—" },
                      { label: "Fat", value: product.nutrition?.fat || "—" },
                      { label: "Carbs", value: product.nutrition?.carbs || "—" },
                      { label: "Fiber", value: product.nutrition?.fiber || "—" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.label}</span>
                        <span className="font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="storage" className="mt-4">
                <div className="rounded-xl bg-secondary/30 p-5 space-y-2 text-sm text-muted-foreground">
                  <p>Store in a cool, dry place away from direct sunlight.</p>
                  <p>Once opened, reseal the package tightly or transfer to an airtight container.</p>
                  <p>For extended freshness, refrigerate after opening. Best consumed within 3 months of purchase.</p>
                </div>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4">
                <div className="rounded-xl bg-secondary/30 p-5 space-y-2 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Domestic:</strong> 3-5 business days via TCS/Leopards courier. COD available.</p>
                  <p><strong className="text-foreground">International:</strong> 7-14 business days. Available to UAE, UK, US, Canada & more.</p>
                  <p>All orders are carefully packed with protective packaging to ensure freshness.</p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <section className="mt-24">
            <AnimatedSection>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-8">
                You May Also Like
              </h2>
            </AnimatedSection>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group">
                  <div className="overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                    <div className="aspect-[4/3] bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-stone-900 flex items-center justify-center relative overflow-hidden">
                      {p.image_url ? (
                        <Image src={p.image_url} alt={p.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <span className="text-5xl opacity-30">
                          {categoryEmoji[p.category] || "🥜"}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">
                        {p.origin}
                      </p>
                      <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors">
                        {p.name}
                      </h3>
                      {p.weights.length > 0 && (
                        <p className="mt-2 font-bold">
                          {formatPrice(p.weights[0].price)}
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            / {p.weights[0].label}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
