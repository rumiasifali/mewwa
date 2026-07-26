import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Origins — QAAQ",
  description:
    "Five valleys, one standard. Learn how QAAQ sources premium dry fruits directly from growers across Hunza, Chitral, Kandahar, Rafsanjan and Balochistan.",
};

/* ─── design tokens ─── */
const ink = "#1A1512";
const gold = "#C8922E";
const goldLt = "#E7C079";
const paper = "#FBF9F5";
const paper2 = "#F5F1EA";
const line = "#E7E1D7";
const body = "#4A4139";
const muted = "#7C7268";
const faint = "#B0A69A";
const placeholder = "#F0EBE3";

/* ─── data ─── */
const stats = [
  { value: "5", label: "Valleys" },
  { value: "12+", label: "Products" },
  { value: "48h", label: "Pack to ship" },
  { value: "4.8\u2605", label: "Average rating" },
];

const steps = [
  {
    title: "Harvest season begins",
    body: "Every year between June and October, our partner growers across five valleys hand-pick at peak ripeness. No machine harvesting, no shortcuts.",
  },
  {
    title: "Grower delivers to us",
    body: "We collect directly from the families we work with — no wholesale mandis, no anonymous middlemen. Every lot is traceable to a single farm.",
  },
  {
    title: "Lab testing",
    body: "Each batch is tested for moisture, aflatoxin and foreign matter before we accept it. Anything that doesn't pass goes back.",
  },
  {
    title: "Weighed and sealed",
    body: "Orders are packed the same day they're placed, sealed in food-grade nitrogen-flushed pouches to lock in freshness.",
  },
  {
    title: "Dispatched to you",
    body: "We ship within 48 hours nationwide. Cold-chain for heat-sensitive items, tracked delivery for everything.",
  },
];

const valleys = [
  { name: "Hunza", region: "Gilgit-Baltistan, Pakistan" },
  { name: "Chitral", region: "Khyber Pakhtunkhwa, Pakistan" },
  { name: "Kandahar", region: "Southern Afghanistan" },
  { name: "Rafsanjan", region: "Kerman Province, Iran" },
  { name: "Balochistan", region: "Western Pakistan" },
];

const values = [
  {
    title: "Single-origin only",
    body: "Every product is traceable to one valley, one harvest. We never blend origins or mix seasons.",
  },
  {
    title: "Lab-tested every batch",
    body: "Moisture, aflatoxin, foreign matter — tested before we accept a single kilogram.",
  },
  {
    title: "Packed the day you order",
    body: "Nothing sits on a shelf. Your order triggers the pack line. Sealed, weighed, shipped.",
  },
  {
    title: "Direct from grower",
    body: "No wholesale markets, no anonymous supply chains. We know every family we buy from by name.",
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

export default function AboutPage() {
  return (
    <div style={{ background: paper }}>
      {/* ───────────── 1. Hero band ───────────── */}
      <section
        style={{
          width: "100%",
          aspectRatio: "21/9",
          overflow: "hidden",
          background: placeholder,
          position: "relative",
        }}
      >
        {/* placeholder for hero photo */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: faint,
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: ".04em",
          }}
        >
          Origins hero photograph
        </div>

        {/* gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(15,12,10,.7), transparent 60%)",
          }}
        />

        {/* text overlay */}
        <div
          style={{
            position: "absolute",
            left: 28,
            bottom: 32,
            zIndex: 1,
          }}
        >
          <p style={eyebrowStyle}>Our story</p>
          <h1
            style={{
              fontSize: "clamp(36px, 4.6vw, 64px)",
              fontWeight: 800,
              letterSpacing: "-.045em",
              color: "#fff",
              marginTop: 14,
              lineHeight: 1.05,
            }}
          >
            Five valleys, one standard.
          </h1>
        </div>
      </section>

      {/* ───────────── 2. Stat band ───────────── */}
      <section
        style={{
          background: paper2,
          borderTop: `1px solid ${line}`,
          borderBottom: `1px solid ${line}`,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "0 28px",
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
          }}
        >
          {stats.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: "40px 28px",
                borderRight:
                  i < stats.length - 1 ? `1px solid ${line}` : "none",
              }}
            >
              <div
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  letterSpacing: "-.04em",
                  color: ink,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: "10.5px",
                  letterSpacing: ".2em",
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

      {/* ───────────── 3. Timeline ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "96px 28px 0",
        }}
      >
        <p style={eyebrowStyle}>From harvest to home</p>
        <h2
          style={{
            fontSize: "clamp(34px, 4vw, 54px)",
            fontWeight: 800,
            letterSpacing: "-.04em",
            color: ink,
            marginTop: 14,
            lineHeight: 1.1,
          }}
        >
          How a lot reaches you
        </h2>

        <div style={{ marginTop: 48 }}>
          {steps.map((step, i) => (
            <div
              key={step.title}
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr",
                gap: 24,
              }}
            >
              {/* number column */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: ink,
                    color: gold,
                    fontSize: 18,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div
                    style={{
                      width: 1,
                      flex: 1,
                      background: line,
                    }}
                  />
                )}
              </div>

              {/* content column */}
              <div style={{ paddingBottom: i < steps.length - 1 ? 40 : 0 }}>
                <div
                  style={{
                    fontSize: 19,
                    fontWeight: 650,
                    letterSpacing: "-.025em",
                    color: ink,
                    lineHeight: 1.3,
                    paddingTop: 10,
                  }}
                >
                  {step.title}
                </div>
                <p
                  style={{
                    fontSize: "14.5px",
                    lineHeight: 1.65,
                    color: body,
                    maxWidth: 520,
                    marginTop: 8,
                  }}
                >
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── 4. Portrait + pull quote ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "96px 28px 0",
          display: "grid",
          gridTemplateColumns: "1fr 1.2fr",
          gap: 52,
          alignItems: "center",
        }}
      >
        {/* portrait placeholder */}
        <div
          style={{
            aspectRatio: "3/4",
            background: placeholder,
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: faint,
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Founder portrait
        </div>

        {/* pull quote */}
        <div>
          <blockquote
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontStyle: "italic",
              fontSize: 28,
              lineHeight: 1.35,
              color: "#2E2721",
              margin: 0,
              padding: 0,
              border: "none",
            }}
          >
            &ldquo;We don&rsquo;t buy from wholesale markets. We buy from the
            same families every season, and they know we&rsquo;ll be back.&rdquo;
          </blockquote>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: muted,
              marginTop: 20,
            }}
          >
            — Founder, QAAQ
          </p>
        </div>
      </section>

      {/* ───────────── 5. Valley grid ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "96px 28px 0",
        }}
      >
        <p style={eyebrowStyle}>Where we source</p>
        <h2
          style={{
            fontSize: "clamp(34px, 4vw, 54px)",
            fontWeight: 800,
            letterSpacing: "-.04em",
            color: ink,
            marginTop: 14,
            lineHeight: 1.1,
          }}
        >
          The valleys
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 1,
            background: line,
            marginTop: 32,
          }}
        >
          {valleys.map((v) => (
            <div
              key={v.name}
              style={{
                position: "relative",
                aspectRatio: "3/4",
                background: paper,
                overflow: "hidden",
              }}
            >
              {/* image placeholder */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: placeholder,
                }}
              />

              {/* dark gradient */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(15,12,10,.65), transparent 55%)",
                }}
              />

              {/* text */}
              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  zIndex: 1,
                }}
              >
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#fff",
                    lineHeight: 1.2,
                  }}
                >
                  {v.name}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,.6)",
                    marginTop: 4,
                  }}
                >
                  {v.region}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────────── 6. Values ───────────── */}
      <section
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "96px 28px 110px",
        }}
      >
        <h2
          style={{
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: "-.04em",
            color: ink,
            lineHeight: 1.1,
          }}
        >
          What we believe
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1,
            background: line,
            border: `1px solid ${line}`,
            marginTop: 24,
          }}
        >
          {values.map((v) => (
            <div
              key={v.title}
              style={{
                background: paper,
                padding: 28,
              }}
            >
              {/* gold dot */}
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: gold,
                }}
              />
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 650,
                  color: ink,
                  marginTop: 14,
                  letterSpacing: "-.02em",
                  lineHeight: 1.25,
                }}
              >
                {v.title}
              </div>
              <p
                style={{
                  fontSize: "13.5px",
                  lineHeight: 1.6,
                  color: muted,
                  marginTop: 8,
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
