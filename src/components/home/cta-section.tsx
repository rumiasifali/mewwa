"use client";

import Link from "next/link";
import { motion } from "@/components/shared/motion";
import { useSiteSettings } from "@/contexts/site-settings-context";

export function CTASection() {
  const { whatsappNumber } = useSiteSettings();
  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "96px 28px 110px" }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 lg:grid-cols-[1.1fr_.9fr]"
        style={{
          position: "relative",
          overflow: "hidden",
          background: "#2A211A",
          minHeight: "400px",
        }}
      >
        {/* Text side */}
        <div
          className="flex flex-col justify-center"
          style={{ padding: "64px 56px" }}
        >
          <div className="qaaq-eyebrow">Order in two minutes</div>
          <h2
            style={{
              margin: "18px 0 0",
              fontSize: "clamp(34px, 4vw, 52px)",
              lineHeight: 1.02,
              letterSpacing: "-.04em",
              fontWeight: 800,
              color: "#fff",
            }}
          >
            Send us a list.
            <br />
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
                color: "#E7C079",
              }}
            >
              We&apos;ll do the rest.
            </span>
          </h2>
          <p
            style={{
              margin: "20px 0 0",
              fontSize: "16px",
              lineHeight: 1.65,
              color: "rgba(255,255,255,.6)",
              maxWidth: "400px",
            }}
          >
            Message us what you want and how much. We confirm weight and price,
            pack it the same day, and send you the courier tracking. Card
            checkout is coming soon.
          </p>
          <div className="mt-[34px] flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="qaaq-press inline-flex items-center gap-[10px]"
              style={{
                height: "54px",
                padding: "0 26px",
                background: "#1FA855",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 600,
                borderRadius: "3px",
              }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="#fff">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Order on WhatsApp
            </a>
            <Link
              href="/products"
              className="inline-flex items-center gap-2"
              style={{
                height: "54px",
                padding: "0 24px",
                border: "1px solid rgba(255,255,255,.24)",
                color: "#fff",
                fontSize: "15px",
                fontWeight: 500,
                borderRadius: "3px",
              }}
            >
              Browse products
            </Link>
          </div>
        </div>

        {/* Image side */}
        <div className="relative overflow-hidden hidden lg:block" style={{ background: "#EDE7DC" }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span style={{ fontSize: "13px", color: "#9A9086", letterSpacing: ".1em", textTransform: "uppercase" }}>
              Packing photograph
            </span>
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              background: "linear-gradient(to right, #2A211A, rgba(42,33,26,.1) 45%, transparent)",
            }}
          />
        </div>
      </motion.div>
    </section>
  );
}
