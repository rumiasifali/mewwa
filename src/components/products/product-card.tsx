"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { MessageCircle, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, getWhatsAppLink } from "@/lib/constants";
import type { Product } from "@/types";

export function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const [selectedWeight, setSelectedWeight] = useState(0);
  const [hovered, setHovered] = useState(false);
  const currentWeight = product.weights[selectedWeight];

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="group block relative aspect-[3/4] rounded-2xl overflow-hidden bg-card shadow-sm cursor-pointer"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => window.location.href = `/products/${product.slug}`}
        role="link"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') window.location.href = `/products/${product.slug}`;
        }}
      >
        {/* Image */}
        <div className="absolute inset-0 bg-stone-100 dark:bg-stone-900">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-100 to-stone-100 dark:from-amber-950/40 dark:to-stone-900">
              <span className="text-7xl sm:text-8xl opacity-20 select-none">🥜</span>
            </div>
          )}
        </div>

        {/* Tag badges — top right */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 items-end">
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

        {/* Always-visible bottom strip — location + title */}
        <div className="absolute bottom-0 left-0 right-0 z-10">
          <div className="bg-gradient-to-t from-black/80 via-black/50 to-transparent pt-10 pb-3 px-3">
            {product.origin && (
              <span className="inline-flex items-center gap-1 text-white/70 text-[10px] font-medium uppercase tracking-wider mb-1">
                <MapPin className="w-2.5 h-2.5" />
                {product.origin}
              </span>
            )}
            <p className="text-sm font-semibold text-white leading-snug line-clamp-2">
              {product.name}
            </p>
          </div>
        </div>

        {/* Hover overlay — adds weight/price/order on top (desktop only) */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="overlay"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 12 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="hidden sm:flex absolute inset-0 z-20 flex-col justify-end"
            >
              {/* Gradient backdrop */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

              {/* Content */}
              <div className="relative p-4 space-y-3">
                {/* Name */}
                <h3 className="text-base font-bold text-white leading-snug line-clamp-2">
                  {product.name}
                </h3>

                {/* Weight selector */}
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.preventDefault()}
                >
                  {product.weights.map((w, i) => (
                    <button
                      key={w.grams}
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedWeight(i);
                      }}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        i === selectedWeight
                          ? "bg-white text-black"
                          : "bg-white/15 text-white/80 hover:bg-white/25"
                      }`}
                    >
                      {w.label}
                    </button>
                  ))}
                </div>

                {/* Price + WhatsApp */}
                <div className="flex items-center justify-between">
                  <motion.span
                    key={currentWeight?.price}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-lg font-bold text-white"
                  >
                    {currentWeight ? formatPrice(currentWeight.price) : "—"}
                  </motion.span>

                  <a
                    href={getWhatsAppLink(product, currentWeight?.label)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Order
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
