"use client";

import { motion } from "@/components/shared/motion";

const origins = [
  {
    name: "Hunza Valley",
    alt: "GB",
    what: "Sun-dried apricots, organic walnuts, mulberries from 8,000 ft orchards",
    season: "Jul – Sep",
  },
  {
    name: "Kandahar",
    alt: "AFG",
    what: "Mamra almonds — oil-rich, hand-cracked from wild orchards",
    season: "Sep – Nov",
  },
  {
    name: "Rafsanjan",
    alt: "IRN",
    what: "Akbari pistachios — long-kernel, roasted in small batches",
    season: "Sep – Oct",
  },
  {
    name: "Chitral",
    alt: "KPK",
    what: "Chilgoza pine nuts — hand-harvested from old-growth forests",
    season: "Oct – Dec",
  },
  {
    name: "Balochistan",
    alt: "PAK",
    what: "Kaghazi almonds, dates from Panjgur, wild figs from Kalat",
    season: "Aug – Nov",
  },
];

export function StorySection() {
  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "96px 28px 0" }}>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.15fr] gap-16 items-start">
        {/* Left — sticky intro */}
        <div className="lg:sticky lg:top-[120px]">
          <div className="qaaq-eyebrow">03 — Traceability</div>
          <h2
            style={{
              margin: "16px 0 0",
              fontSize: "clamp(34px, 4vw, 54px)",
              lineHeight: 1,
              letterSpacing: "-.04em",
              fontWeight: 800,
            }}
          >
            Every bag names
            <br />
            its valley.
          </h2>
          <p
            style={{
              margin: "22px 0 0",
              fontSize: "16px",
              lineHeight: 1.7,
              color: "#4A4139",
              maxWidth: "400px",
            }}
          >
            We buy from the same growers each season, not from a wholesale
            market. That&apos;s why we can print the village on the label — and
            why the price moves with the harvest instead of the shelf.
          </p>
          <div
            className="mt-[30px] overflow-hidden"
            style={{ aspectRatio: "4/3", background: "#F0EBE3" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <span style={{ fontSize: "13px", color: "#9A9086", letterSpacing: ".1em", textTransform: "uppercase" }}>
                Grower photograph
              </span>
            </div>
          </div>
        </div>

        {/* Right — origins list */}
        <div style={{ borderTop: "1px solid #1A1512" }}>
          {origins.map((o, i) => (
            <motion.div
              key={o.name}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                delay: i * 0.08,
                duration: 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="grid grid-cols-[64px_1fr_96px] gap-5 items-center"
              style={{
                padding: "26px 0",
                borderBottom: "1px solid #E7E1D7",
              }}
            >
              <div
                className="overflow-hidden"
                style={{ width: "64px", height: "64px", background: "#F0EBE3" }}
              />
              <div>
                <div className="flex items-center gap-[10px]">
                  <h3 style={{ margin: 0, fontSize: "19px", fontWeight: 650, letterSpacing: "-.025em" }}>
                    {o.name}
                  </h3>
                  <span
                    style={{
                      fontSize: "10px",
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "#7C7268",
                      border: "1px solid #DCD3C5",
                      padding: "2px 6px",
                    }}
                  >
                    {o.alt}
                  </span>
                </div>
                <p style={{ margin: "6px 0 0", fontSize: "13.5px", color: "#7C7268", lineHeight: 1.55 }}>
                  {o.what}
                </p>
              </div>
              <div className="text-right">
                <div style={{ fontSize: "12px", fontWeight: 600, color: "#4A4139" }}>{o.season}</div>
                <div style={{ fontSize: "10.5px", letterSpacing: ".12em", textTransform: "uppercase", color: "#B0A69A", marginTop: "3px" }}>
                  Harvest
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
