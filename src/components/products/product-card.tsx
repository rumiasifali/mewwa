"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, ArrowUpRight, MapPin } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { formatPrice, getWhatsAppLink } from "@/lib/constants";
import type { Product } from "@/types";

const categoryEmoji: Record<string, string> = {
  nuts: "🥜",
  "dried-fruits": "🍑",
  seeds: "🌻",
  "gift-boxes": "🎁",
};

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const currentWeight = product.weights[selectedWeight];

  // 3D tilt — subtle (4deg max)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [4, -4]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-4, 4]), {
    stiffness: 300,
    damping: 30,
  });

  function handleMouseMove(e: React.MouseEvent) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
    setIsHovered(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        delay: index * 0.06,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="group perspective-[1200px]"
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative h-full"
      >
        {/* Ambient glow */}
        <div
          className={`absolute -inset-0.5 rounded-[18px] bg-gradient-to-br from-amber-400/15 via-amber-500/8 to-orange-400/15 blur-lg transition-opacity duration-500 ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="relative h-full rounded-2xl overflow-hidden bg-card transition-all duration-500">
          {/* Image — 1:1 square aspect ratio (industry standard) */}
          <div className="relative aspect-square overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-amber-50/80 to-stone-100 dark:from-amber-950/40 dark:via-stone-900 dark:to-stone-950">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              ) : (
                <>
                  <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
                      backgroundSize: "24px 24px",
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                      y: isHovered ? -6 : 0,
                      scale: isHovered ? 1.05 : 1,
                      rotate: isHovered ? 4 : 0,
                    }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <span className="text-7xl sm:text-8xl opacity-20 select-none">
                      {categoryEmoji[product.category] || "🥜"}
                    </span>
                  </motion.div>
                </>
              )}
            </div>

            {/* Gradient — lighter, just enough for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* Top — tags only (compact) */}
            <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between z-10">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-[11px] font-medium">
                <MapPin className="w-2.5 h-2.5" />
                {product.origin}
              </span>
              <div className="flex gap-1">
                {product.tags.includes("bestseller") && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/90 backdrop-blur-sm text-white text-[11px] font-semibold">
                    Bestseller
                  </span>
                )}
                {product.tags.includes("rare") && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/90 backdrop-blur-sm text-white text-[11px] font-semibold">
                    Rare
                  </span>
                )}
                {product.tags.includes("local") && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-sm text-white text-[11px] font-semibold">
                    Local
                  </span>
                )}
              </div>
            </div>

            {/* Bottom — product name on image */}
            <div className="absolute bottom-0 left-0 right-0 p-3.5 z-10">
              <Link href={`/products/${product.slug}`} className="block">
                <h3 className="text-[15px] font-semibold text-white leading-snug tracking-tight group-hover:text-amber-200 transition-colors duration-300 line-clamp-2">
                  {product.name}
                </h3>
              </Link>
              {/* Description reveal on hover */}
              <motion.p
                initial={false}
                animate={{
                  height: isHovered ? "auto" : 0,
                  opacity: isHovered ? 1 : 0,
                  marginTop: isHovered ? 4 : 0,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="text-xs text-white/50 line-clamp-2 leading-relaxed overflow-hidden"
              >
                {product.description}
              </motion.p>
            </div>
          </div>

          {/* Content — compact bottom strip */}
          <div className="px-3.5 py-3 space-y-2.5">
            {/* Weight selector — compact pills */}
            <div className="flex items-center gap-1">
              {product.weights.map((w, i) => (
                <button
                  key={w.grams}
                  onClick={() => setSelectedWeight(i)}
                  className={`relative flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all duration-300 ${
                    i === selectedWeight
                      ? "bg-foreground text-background"
                      : "bg-secondary/80 text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {w.label}
                  {i === selectedWeight && (
                    <motion.div
                      layoutId={`weight-${product.id}`}
                      className="absolute inset-0 rounded-lg bg-foreground -z-10"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Price + actions */}
            <div className="flex items-center justify-between">
              <motion.span
                key={currentWeight.price}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-base font-bold tracking-tight text-foreground"
              >
                {formatPrice(currentWeight.price)}
              </motion.span>

              <div className="flex items-center gap-1.5">
                <motion.a
                  href={getWhatsAppLink(product, currentWeight.label)}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white shadow-sm shadow-green-500/20 hover:bg-green-600 transition-colors"
                  title="Order on WhatsApp"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                </motion.a>
                <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
                  <Link
                    href={`/products/${product.slug}`}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-foreground text-background hover:bg-foreground/80 transition-colors"
                    title="View details"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
