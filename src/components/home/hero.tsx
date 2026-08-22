"use client";

import Link from "next/link";
import Image from "next/image";
import { useSiteSettings } from "@/contexts/site-settings-context";
import { motion } from "@/components/shared/motion";
import { ArrowRight } from "lucide-react";
import { getWhatsAppLink } from "@/lib/constants";

const ease = [0.22, 1, 0.36, 1] as const;

const fadeUpItem = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.9, ease },
});

const fadeInItem = (delay: number) => ({
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { delay, duration: 0.8, ease },
});

const STATS = [
  { value: "Small batches", label: "Packed to order" },
  { value: "Direct", label: "From the grower" },
  { value: "Lab-tested", label: "Every batch" },
  { value: "48 hrs", label: "Farm to pack" },
];

import type { Product } from "@/types";
import { formatPrice } from "@/lib/constants";

export function Hero({ todaysPick }: { todaysPick?: Product | null }) {
  const { whatsappNumber } = useSiteSettings();
  const pick = todaysPick;
  const pickWeight = pick?.weights?.[0];
  return (
    <section
      className="qaaq-hero relative flex items-center overflow-hidden"
      style={{
        minHeight: 760,
        height: "100vh",
        maxHeight: 900,
        backgroundColor: "#1A1512",
        paddingTop: 100,
      }}
    >
      {/* Responsive overrides: drop the hard height floor on short/small
          screens and clean up the stats row when it wraps */}
      <style>{`
        @media (max-width: 640px), (max-height: 700px) {
          .qaaq-hero {
            min-height: 100svh !important;
            height: auto !important;
            max-height: none !important;
            padding-bottom: 48px !important;
          }
        }
        @media (max-width: 767px) {
          .hero-stats { gap: 18px 32px; }
          .hero-stat {
            border-right: none !important;
            padding-right: 0 !important;
            margin-right: 0 !important;
          }
        }
      `}</style>

      {/* Background image */}
      <Image
        src="/hero-banner.png"
        alt="QAAQ Premium Dry Fruits — Mountains of Pakistan"
        fill
        className="object-cover"
        priority
        quality={90}
      />

      {/* Directional dark overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(15,12,10,.94) 0%, rgba(15,12,10,.82) 34%, rgba(15,12,10,.34) 62%, rgba(15,12,10,.15) 100%)",
        }}
      />

      {/* Bottom gradient */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: 180,
          background: "linear-gradient(to top, rgba(15,12,10,.9), transparent)",
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 w-full mx-auto flex"
        style={{ maxWidth: 1400, padding: "0 28px", flexDirection: "column", justifyContent: "center" }}
      >
        <div style={{ maxWidth: 760 }}>
          {/* Eyebrow */}
          <motion.div
            className="flex items-center"
            style={{ gap: 14 }}
            {...fadeInItem(0.1)}
          >
            <span
              style={{
                width: 52,
                height: 1,
                backgroundColor: "#C8922E",
                display: "block",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 11,
                letterSpacing: ".36em",
                textTransform: "uppercase",
                color: "#C8922E",
                fontWeight: 600,
              }}
            >
              Est. 2023 &middot; Gilgit-Baltistan
            </span>
          </motion.div>

          {/* H1 */}
          <h1
            style={{
              marginTop: 26,
              fontSize: "clamp(52px, 6.6vw, 104px)",
              lineHeight: 0.92,
              letterSpacing: "-.045em",
              fontWeight: 800,
              color: "white",
            }}
          >
            <motion.span className="block" {...fadeUpItem(0.2)}>
              The mountains,
            </motion.span>
            <motion.span className="block" {...fadeUpItem(0.34)}>
              weighed and sealed
            </motion.span>
            <motion.span
              className="block"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "#E7C079",
                letterSpacing: "-.02em",
              }}
              {...fadeUpItem(0.48)}
            >
              the day you order.
            </motion.span>
          </h1>

          {/* Paragraph */}
          <motion.p
            className="mt-7"
            style={{
              maxWidth: 470,
              fontSize: 17,
              lineHeight: 1.65,
              color: "rgba(255,255,255,.66)",
            }}
            {...fadeUpItem(0.62)}
          >
            Mamra almonds from Afghan orchards. Akbari pistachios from
            Rafsanjan. Hunza apricots dried on rooftops at 8,000&nbsp;feet.
            Nothing sits in a warehouse waiting for you.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            className="flex items-center flex-wrap"
            style={{ gap: 12, marginTop: 38 }}
            {...fadeUpItem(0.76)}
          >
            {/* Primary */}
            <Link
              href="/products"
              className="qaaq-press inline-flex items-center justify-center"
              style={{
                height: 56,
                padding: "0 30px",
                backgroundColor: "white",
                color: "#1A1512",
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 3,
                textDecoration: "none",
                gap: 12,
              }}
            >
              Shop the collection
              <ArrowRight size={17} strokeWidth={2} />
            </Link>

            {/* Secondary — WhatsApp */}
            <a
              href={getWhatsAppLink(undefined, undefined, whatsappNumber)}
              target="_blank"
              rel="noopener noreferrer"
              className="qaaq-press inline-flex items-center justify-center"
              style={{
                height: 56,
                padding: "0 26px",
                border: "1px solid rgba(255,255,255,.26)",
                color: "white",
                backgroundColor: "rgba(255,255,255,.06)",
                fontSize: 15,
                fontWeight: 500,
                borderRadius: 3,
                textDecoration: "none",
                gap: 10,
              }}
            >
              {/* Green pulse dot */}
              <span
                className="relative flex-shrink-0"
                style={{ width: 7, height: 7 }}
              >
                <span
                  className="relative block"
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    backgroundColor: "#3FD97F",
                    boxShadow: "0 0 0 4px rgba(63,217,127,.22)",
                  }}
                />
              </span>
              Ask us on WhatsApp
            </a>
          </motion.div>

          {/* Stats row */}
          <motion.div
            className="hero-stats flex items-start flex-wrap"
            style={{ marginTop: 64 }}
            {...fadeInItem(1)}
          >
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className="hero-stat"
                style={{
                  borderRight:
                    i < STATS.length - 1
                      ? "1px solid rgba(255,255,255,.14)"
                      : "none",
                  paddingRight: i < STATS.length - 1 ? 38 : 0,
                  marginRight: i < STATS.length - 1 ? 38 : 0,
                }}
              >
                <div
                  style={{
                    fontSize: 27,
                    fontWeight: 700,
                    color: "white",
                    letterSpacing: "-.03em",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.42)",
                    fontWeight: 500,
                    marginTop: 6,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Today's pick floating card — hidden below 1200px */}
      {pick && pickWeight && (
        <>
          <style>{`.hero-pick{display:none}@media(min-width:1200px){.hero-pick{display:block}}`}</style>
          <motion.div
            className="hero-pick absolute"
            style={{
              right: 28,
              bottom: 34,
              width: 262,
              zIndex: 3,
              backgroundColor: "rgba(251,249,245,.96)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              borderRadius: 4,
              padding: 16,
              boxShadow: "0 24px 60px -20px rgba(0,0,0,.5)",
            }}
            {...fadeUpItem(1.1)}
          >
            <div className="flex items-start" style={{ gap: 12 }}>
              {pick.image_url ? (
                <Image
                  src={pick.image_url}
                  alt={pick.name}
                  width={56}
                  height={56}
                  className="flex-shrink-0 object-cover"
                  style={{ borderRadius: 3 }}
                />
              ) : (
                <div
                  className="flex-shrink-0"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: "#EDE7DC",
                    border: "1px solid #E0D8CA",
                    borderRadius: 3,
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div
                  style={{
                    fontSize: 9.5,
                    letterSpacing: ".2em",
                    textTransform: "uppercase",
                    color: "#C8922E",
                    fontWeight: 700,
                  }}
                >
                  Today&apos;s pick
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    fontWeight: 600,
                    letterSpacing: "-.01em",
                    color: "#1A1512",
                    marginTop: 3,
                  }}
                >
                  {pick.name}
                </div>
                <div
                  style={{
                    fontSize: 11.5,
                    color: "#7C7268",
                    marginTop: 2,
                  }}
                >
                  {pick.origin}
                  {pick.tags?.[0] && <> &middot; {pick.tags[0]}</>}
                </div>
              </div>
            </div>

            {/* Divider + price row */}
            <div
              style={{
                borderTop: "1px solid #E7E1D7",
                marginTop: 13,
                paddingTop: 12,
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#1A1512",
                  }}
                >
                  {formatPrice(pickWeight.price)}
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    color: "#7C7268",
                    marginLeft: 3,
                  }}
                >
                  / {pickWeight.label}
                </span>
              </div>
              <Link
                href={`/products/${pick.slug}`}
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "#1A1512",
                  borderBottom: "1px solid #C8922E",
                  textDecoration: "none",
                  lineHeight: 1,
                  paddingBottom: 1,
                }}
              >
                View
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </section>
  );
}
