"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to the UAE, Gulf states, UK, Europe, the USA, and Canada. International orders are packed with extra care and shipped via reliable courier services. WhatsApp us for an exact quote based on your location and order weight.",
  },
  {
    question: "How long does delivery take?",
    answer:
      "Domestic orders within Pakistan typically arrive in 2\u20135 business days depending on your city. International shipments take between 5 and 14 business days. Orders placed before 2 PM are dispatched the same day.",
  },
  {
    question: "What if my order arrives damaged?",
    answer:
      "We take packaging seriously, but if anything arrives damaged, send us a photo on WhatsApp within 24 hours of delivery. We\u2019ll replace the items or issue a full refund\u2014no questions asked.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Absolutely. Once your order is dispatched, you\u2019ll receive a tracking number via WhatsApp and email. You can use it to follow your package in real time through our courier partner\u2019s website.",
  },
];

export function ShippingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div
      style={{
        borderTop: "1px solid #E7E1D7",
        marginTop: 24,
      }}
    >
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            style={{
              borderBottom: "1px solid #E7E1D7",
            }}
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
                padding: "20px 0",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                textAlign: "left",
              }}
            >
              <span
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: "#1A1512",
                }}
              >
                {faq.question}
              </span>
              <ChevronDown
                size={18}
                style={{
                  color: "#7C7268",
                  flexShrink: 0,
                  marginLeft: 16,
                  transition: "transform .2s ease",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {isOpen && (
              <div
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.7,
                  color: "#4A4139",
                  maxWidth: 640,
                  paddingTop: 0,
                  paddingBottom: 20,
                }}
              >
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
