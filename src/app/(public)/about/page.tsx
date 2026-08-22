import type { Metadata } from "next";
import { getProducts, getApprovedTestimonials } from "@/lib/data";

export const metadata: Metadata = {
  title: "Origins — QAAQ",
  description:
    "Five valleys, one standard. Learn how QAAQ sources premium dry fruits directly from growers across Hunza, Chitral, Kandahar, Rafsanjan and Balochistan.",
};

/* ─── design tokens ─── */
const ink = "#1A1512";
const gold = "#C8922E";
const paper = "#FBF9F5";
const line = "#E7E1D7";
const body = "#4A4139";
const muted = "#7C7268";
const placeholder = "#F0EBE3";

/* ─── data ─── */
const steps = [
  {
    when: "Week 1",
    title: "Harvest season begins",
    body: "Every year between June and October, our partner growers across five valleys hand-pick at peak ripeness. No machine harvesting, no shortcuts.",
  },
  {
    when: "Week 2",
    title: "Grower delivers to us",
    body: "We collect directly from the families we work with — no wholesale mandis, no anonymous middlemen. Every lot is traceable to a single farm.",
  },
  {
    when: "Week 3",
    title: "Lab testing",
    body: "Each batch is tested for moisture, aflatoxin and foreign matter before we accept it. Anything that doesn't pass goes back.",
  },
  {
    when: "Week 4",
    title: "Weighed and sealed",
    body: "Orders are packed the same day they're placed, sealed in food-grade nitrogen-flushed pouches to lock in freshness.",
  },
  {
    when: "Week 5",
    title: "Dispatched to you",
    body: "We ship within 48 hours nationwide. Cold-chain for heat-sensitive items, tracked delivery for everything.",
  },
];

const valleys = [
  { name: "Hunza", alt: "Gilgit-Baltistan", what: "Apricots, walnuts, almonds — sun-dried at 8,000 feet.", season: "Jun — Oct" },
  { name: "Chitral", alt: "Khyber Pakhtunkhwa", what: "Pine nuts and walnuts from old-growth forests.", season: "Sep — Nov" },
  { name: "Kandahar", alt: "Southern Afghanistan", what: "Mamra almonds and white figs — the desert grades.", season: "Jul — Sep" },
  { name: "Rafsanjan", alt: "Kerman Province, Iran", what: "Akbari pistachios — the long, split-shell grade.", season: "Sep — Oct" },
  { name: "Balochistan", alt: "Western Pakistan", what: "Black raisins and dates from Quetta basin.", season: "Aug — Nov" },
];

const proof = [
  {
    tag: "Lab-tested",
    title: "Aflatoxin & moisture report",
    body: "Every batch is tested before it's split into pouches. Ask for the report and we'll send it.",
  },
  {
    tag: "Packed to order",
    title: "Sealed the day it ships",
    body: "Nothing is pre-bagged. Your weight is measured, vacuum-sealed and dated after you confirm.",
  },
  {
    tag: "Direct sourcing",
    title: "Three seasons, same growers",
    body: "No wholesale market in between. We name the valley because we were standing in it.",
  },
  {
    tag: "Single-origin",
    title: "One valley, one harvest",
    body: "Every product is traceable to one valley, one harvest. We never blend origins or mix seasons.",
  },
];

/* ─── shared micro-styles ─── */
const eyebrowStyle: React.CSSProperties = {
  color: gold,
  fontSize: "10.5px",
  letterSpacing: ".32em",
  textTransform: "uppercase",
  fontWeight: 700,
};

export default async function AboutPage() {
  const [products, testimonials] = await Promise.all([
    getProducts(),
    getApprovedTestimonials(),
  ]);

  const stats = [
    { value: "5", label: "Valleys" },
    { value: `${products.length}`, label: "Products" },
    { value: "48h", label: "Pack to ship" },
  ];

  if (testimonials.length > 0) {
    const average = (
      testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length
    ).toFixed(1);
    stats.push({ value: `${average}★`, label: "Average rating" });
  }

  return (
    <div style={{ background: paper }}>
      {/* ───────────── 1. Text-first hero ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "52px 28px 0",
        }}
      >
        <div style={eyebrowStyle}>Origins</div>
        <h1
          style={{
            margin: "18px 0 0",
            fontSize: "clamp(40px, 5.6vw, 84px)",
            lineHeight: 0.96,
            letterSpacing: "-.05em",
            fontWeight: 800,
            maxWidth: 900,
            color: ink,
          }}
        >
          We started because the good stuff never left the valley.
        </h1>
        <p
          style={{
            margin: "26px 0 0",
            fontSize: 18,
            lineHeight: 1.65,
            color: body,
            maxWidth: 620,
          }}
        >
          The best fruit from Hunza gets eaten in Hunza, or sold in bulk to a
          market that mixes it with everything else. Three seasons ago we started
          buying it directly, at the price the grower asks, and shipping it
          sealed.
        </p>

        {/* Hero image */}
        <div
          style={{
            marginTop: 48,
            aspectRatio: "21/9",
            overflow: "hidden",
            background: placeholder,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#B0A69A",
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: ".04em",
          }}
        >
          Wide landscape — the valley
        </div>

        {/* ───────────── 2. Stat band ───────────── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
            gap: 1,
            background: line,
            borderBottom: `1px solid ${line}`,
          }}
        >
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                background: paper,
                padding: "28px 24px 30px",
              }}
            >
              <div
                style={{
                  fontSize: 34,
                  fontWeight: 800,
                  letterSpacing: "-.04em",
                  color: ink,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  color: muted,
                  fontWeight: 600,
                  marginTop: 8,
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── 3. Timeline + Portrait 2-column ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "88px 28px 0",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 64,
          }}
        >
          {/* Left: Timeline */}
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 36,
                fontWeight: 800,
                letterSpacing: "-.04em",
                lineHeight: 1.05,
                color: ink,
              }}
            >
              How a lot reaches you
            </h2>

            <div style={{ marginTop: 32 }}>
              {steps.map((step) => (
                <div
                  key={step.title}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "78px 1fr",
                    gap: 20,
                    padding: "20px 0",
                    borderTop: `1px solid ${line}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 11,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: gold,
                      fontWeight: 700,
                      paddingTop: 3,
                    }}
                  >
                    {step.when}
                  </span>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 17.5,
                        fontWeight: 650,
                        letterSpacing: "-.02em",
                        color: ink,
                      }}
                    >
                      {step.title}
                    </h3>
                    <p
                      style={{
                        margin: "7px 0 0",
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: muted,
                      }}
                    >
                      {step.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Portrait + pull quote */}
          <div>
            <div
              style={{
                aspectRatio: "4/5",
                overflow: "hidden",
                background: placeholder,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#B0A69A",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              Founder / grower portrait
            </div>
            <div
              style={{
                marginTop: 20,
                padding: 24,
                background: ink,
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 19,
                  lineHeight: 1.55,
                  color: "#fff",
                  fontFamily: "'Instrument Serif', serif",
                  fontStyle: "italic",
                }}
              >
                &ldquo;If I wouldn&rsquo;t put it on my own table, it
                doesn&rsquo;t get a label.&rdquo;
              </p>
              <div
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.5)",
                  fontWeight: 600,
                }}
              >
                Founder, QAAQ
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── 4. Valley grid ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "88px 28px 0",
        }}
      >
        <div
          style={{
            paddingTop: 32,
            borderTop: `1px solid ${ink}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 36,
              fontWeight: 800,
              letterSpacing: "-.04em",
              lineHeight: 1.05,
              color: ink,
            }}
          >
            The five valleys
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: 1,
              background: line,
              border: `1px solid ${line}`,
              marginTop: 28,
            }}
          >
            {valleys.map((v) => (
              <div
                key={v.name}
                style={{
                  background: paper,
                  padding: "0 0 20px",
                }}
              >
                {/* Image area */}
                <div
                  style={{
                    aspectRatio: "4/5",
                    overflow: "hidden",
                    background: placeholder,
                  }}
                />

                {/* Text below image */}
                <div style={{ padding: "16px 18px 0" }}>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: 17,
                      fontWeight: 650,
                      letterSpacing: "-.02em",
                      color: ink,
                    }}
                  >
                    {v.name}
                  </h3>
                  <div
                    style={{
                      fontSize: 11,
                      letterSpacing: ".14em",
                      textTransform: "uppercase",
                      color: muted,
                      marginTop: 5,
                      fontWeight: 600,
                    }}
                  >
                    {v.alt}
                  </div>
                  <p
                    style={{
                      margin: "10px 0 0",
                      fontSize: 13,
                      lineHeight: 1.55,
                      color: muted,
                    }}
                  >
                    {v.what}
                  </p>
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 12,
                      fontWeight: 600,
                      color: gold,
                    }}
                  >
                    {v.season}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── 5. Proof / Values grid ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "0 28px",
        }}
      >
        <div
          style={{
            margin: "88px 0 110px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: line,
            border: `1px solid ${line}`,
          }}
        >
          {proof.map((v) => (
            <div
              key={v.title}
              style={{
                background: paper,
                padding: "26px 24px 30px",
              }}
            >
              <span
                style={{
                  fontSize: "10.5px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: gold,
                }}
              >
                {v.tag}
              </span>
              <h3
                style={{
                  margin: "14px 0 0",
                  fontSize: 19,
                  fontWeight: 650,
                  letterSpacing: "-.025em",
                  color: ink,
                }}
              >
                {v.title}
              </h3>
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: "13.5px",
                  lineHeight: 1.6,
                  color: muted,
                }}
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
