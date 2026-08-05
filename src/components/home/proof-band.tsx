"use client";

import { motion } from "@/components/shared/motion";
import { Check } from "lucide-react";

const proofItems = [
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
    tag: "6,400 orders",
    title: "4.8 average, 621 reviews",
    body: "Reviews are tied to real order numbers. We publish the bad ones too.",
  },
];

export function ProofBand() {
  return (
    <section
      style={{
        marginTop: "96px",
        background: "#F5F1EA",
        borderTop: "1px solid #E7E1D7",
        borderBottom: "1px solid #E7E1D7",
      }}
    >
      <div
        className="mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ maxWidth: "1400px", padding: "0 28px" }}
      >
        {proofItems.map((pr, i) => (
          <motion.div
            key={pr.tag}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{
              delay: i * 0.1,
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
            style={{
              padding: "44px 30px 46px",
              borderRight: "1px solid #E7E1D7",
            }}
          >
            <div className="flex items-center gap-[9px]">
              <span
                className="flex items-center justify-center shrink-0"
                style={{
                  width: "22px",
                  height: "22px",
                  borderRadius: "50%",
                  background: "#1A1512",
                }}
              >
                <Check
                  className="text-[#C8922E]"
                  style={{ width: "11px", height: "11px", strokeWidth: 3 }}
                />
              </span>
              <span
                style={{
                  fontSize: "10.5px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#4A4139",
                }}
              >
                {pr.tag}
              </span>
            </div>
            <h3
              style={{
                margin: "16px 0 0",
                fontSize: "20px",
                fontWeight: 650,
                letterSpacing: "-.025em",
              }}
            >
              {pr.title}
            </h3>
            <p
              style={{
                margin: "8px 0 0",
                fontSize: "13.5px",
                lineHeight: 1.6,
                color: "#7C7268",
                maxWidth: "230px",
              }}
            >
              {pr.body}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
