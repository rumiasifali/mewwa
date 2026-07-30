import { ShippingFaq } from "./shipping-faq";

const domesticRows = [
  { zone: "Punjab & KPK", weight: "Up to 5kg", rate: "PKR 250", eta: "2\u20133 days" },
  { zone: "Sindh & Balochistan", weight: "Up to 5kg", rate: "PKR 350", eta: "3\u20135 days" },
  { zone: "GB & AJK", weight: "Up to 5kg", rate: "PKR 300", eta: "3\u20134 days" },
];

const internationalRows = [
  { zone: "UAE & Gulf", weight: "Up to 2kg", rate: "PKR 2,500", eta: "5\u20137 days" },
  { zone: "UK & Europe", weight: "Up to 2kg", rate: "PKR 4,500", eta: "7\u201312 days" },
  { zone: "USA & Canada", weight: "Up to 2kg", rate: "PKR 5,000", eta: "7\u201314 days" },
];

const packingSteps = [
  {
    step: "01",
    title: "Weighed to order",
    body: "Every item is weighed fresh per your order\u2014no pre-packed, shelf-sitting stock.",
  },
  {
    step: "02",
    title: "Vacuum sealed",
    body: "Air is removed to lock in flavour and extend shelf life before shipping.",
  },
  {
    step: "03",
    title: "Nitrogen flushed",
    body: "A nitrogen flush replaces residual oxygen, keeping nuts crisp and oils stable.",
  },
  {
    step: "04",
    title: "Double-boxed",
    body: "Sealed pouches go into a rigid inner box, then a padded outer carton for transit.",
  },
];

const kvLabelStyle: React.CSSProperties = {
  fontSize: 10,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#7C7268",
};

const kvValueStyle: React.CSSProperties = {
  fontSize: 13.5,
  color: "#2A211A",
  fontWeight: 600,
  marginTop: 4,
};

function RateCards({
  rows,
}: {
  rows: { zone: string; weight: string; rate: string; eta: string }[];
}) {
  return (
    <div
      style={{
        marginTop: 20,
        display: "grid",
        gap: "1px",
        background: "#E7E1D7",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {rows.map((row) => (
        <div
          key={row.zone}
          style={{
            background: "#fff",
            padding: "16px 18px",
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 650,
              color: "#1A1512",
              marginBottom: 12,
            }}
          >
            {row.zone}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <div style={kvLabelStyle}>Weight</div>
              <div style={kvValueStyle}>{row.weight}</div>
            </div>
            <div>
              <div style={kvLabelStyle}>Rate</div>
              <div style={kvValueStyle}>{row.rate}</div>
            </div>
            <div>
              <div style={kvLabelStyle}>ETA</div>
              <div style={kvValueStyle}>{row.eta}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShippingPage() {
  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 28px 110px" }}>
      {/* ── Header ── */}
      <div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: ".14em",
            color: "#C8922E",
            margin: 0,
          }}
        >
          Shipping
        </p>
        <h1
          style={{
            fontSize: "clamp(34px, 4.2vw, 52px)",
            fontWeight: 800,
            letterSpacing: "-.045em",
            color: "#1A1512",
            lineHeight: 1.1,
            marginTop: 12,
          }}
        >
          Shipping &amp; delivery
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#4A4139",
            maxWidth: 520,
            lineHeight: 1.65,
            marginTop: 12,
          }}
        >
          We ship across Pakistan and internationally. Every order is packed
          fresh to ensure your dry fruits arrive in perfect condition.
        </p>
      </div>

      {/* ── Zone panels ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          background: "#E7E1D7",
          border: "1px solid #E7E1D7",
          marginTop: 32,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Domestic */}
        <div style={{ background: "#FBF9F5", padding: 32 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".14em",
              color: "#C8922E",
              margin: 0,
            }}
          >
            Domestic
          </p>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 750,
              color: "#1A1512",
              marginTop: 8,
            }}
          >
            Pakistan
          </h3>
          <RateCards rows={domesticRows} />
          <div
            style={{
              fontSize: 13,
              color: "#4E7A3E",
              background: "#E6EFE0",
              padding: "12px 16px",
              marginTop: 16,
              borderRadius: 2,
            }}
          >
            Free shipping on orders over PKR 5,000
          </div>
        </div>

        {/* International */}
        <div style={{ background: "#FBF9F5", padding: 32 }}>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: ".14em",
              color: "#C8922E",
              margin: 0,
            }}
          >
            International
          </p>
          <h3
            style={{
              fontSize: 24,
              fontWeight: 750,
              color: "#1A1512",
              marginTop: 8,
            }}
          >
            Worldwide
          </h3>
          <RateCards rows={internationalRows} />
          <div
            style={{
              fontSize: 13,
              color: "#7C7268",
              background: "#F5F1EA",
              padding: "12px 16px",
              marginTop: 16,
              borderRadius: 2,
            }}
          >
            Rates vary by weight. WhatsApp us for an exact quote.
          </div>
        </div>
      </div>

      {/* ── Packing steps ── */}
      <div style={{ marginTop: 64 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1A1512" }}>
          How we pack
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginTop: 24,
          }}
        >
          {packingSteps.map((step) => (
            <div
              key={step.step}
              style={{
                background: "#FBF9F5",
                border: "1px solid #E7E1D7",
                borderRadius: 2,
                padding: 24,
              }}
            >
              <span
                style={{
                  fontSize: 32,
                  fontWeight: 800,
                  color: "rgba(200,146,46,.8)",
                  lineHeight: 1,
                }}
              >
                {step.step}
              </span>
              <p
                style={{
                  fontSize: 16,
                  fontWeight: 650,
                  color: "#1A1512",
                  marginTop: 12,
                }}
              >
                {step.title}
              </p>
              <p
                style={{
                  fontSize: 13,
                  lineHeight: 1.6,
                  color: "#7C7268",
                  marginTop: 6,
                }}
              >
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── FAQ accordion ── */}
      <div style={{ marginTop: 64, paddingTop: 64, borderTop: "1px solid #E7E1D7" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#1A1512" }}>
          Frequently asked questions
        </h2>
        <ShippingFaq />
      </div>
    </div>
  );
}
