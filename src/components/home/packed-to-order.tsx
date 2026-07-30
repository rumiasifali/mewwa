"use client";

import { motion } from "@/components/shared/motion";

const steps = [
  {
    n: "01",
    title: "You place an order",
    body: "Via WhatsApp or the site. Tell us what you want, how much, and where to ship.",
    when: "Day 0",
  },
  {
    n: "02",
    title: "We weigh and seal",
    body: "Your exact quantity is pulled from cold storage and vacuum-sealed with the batch number.",
    when: "Same day",
  },
  {
    n: "03",
    title: "Lab slip enclosed",
    body: "The latest aflatoxin and heavy-metal report for that batch goes in the box.",
    when: "Same day",
  },
  {
    n: "04",
    title: "Courier picks up",
    body: "TCS or Leopards, tracked. You get the waybill on WhatsApp within the hour.",
    when: "Next morning",
  },
];

export function PackedToOrder() {
  return (
    <section style={{ maxWidth: "1400px", margin: "0 auto", padding: "96px 28px 0" }}>
      <div
        style={{
          background: "#1A1512",
          padding: "60px 56px 56px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        <div
          style={{
            position: "absolute",
            top: "-120px",
            right: "-80px",
            width: "420px",
            height: "420px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,146,46,.16), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        <div className="relative">
          <div className="qaaq-eyebrow">04 — Packed to order</div>
          <h2
            style={{
              margin: "16px 0 0",
              fontSize: "clamp(30px, 3.4vw, 46px)",
              lineHeight: 1.02,
              letterSpacing: "-.04em",
              fontWeight: 800,
              color: "#fff",
              maxWidth: "640px",
            }}
          >
            Your order is weighed after you place it, not before.
          </h2>

          <div
            className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
            style={{ gap: "1px", background: "rgba(255,255,255,.1)" }}
          >
            {steps.map((st, i) => (
              <motion.div
                key={st.n}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{
                  delay: i * 0.14,
                  duration: 0.9,
                  ease: [0.22, 1, 0.36, 1],
                }}
                style={{
                  background: "#1A1512",
                  padding: "26px 24px 28px",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                    fontWeight: 800,
                    letterSpacing: "-.05em",
                    color: "rgba(200,146,46,.9)",
                    lineHeight: 1,
                  }}
                >
                  {st.n}
                </div>
                <h3
                  style={{
                    margin: "16px 0 0",
                    fontSize: "16.5px",
                    fontWeight: 650,
                    color: "#fff",
                    letterSpacing: "-.02em",
                  }}
                >
                  {st.title}
                </h3>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "13px",
                    lineHeight: 1.65,
                    color: "rgba(255,255,255,.5)",
                  }}
                >
                  {st.body}
                </p>
                <div
                  className="qaaq-eyebrow"
                  style={{ marginTop: "18px", letterSpacing: ".16em" }}
                >
                  {st.when}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
