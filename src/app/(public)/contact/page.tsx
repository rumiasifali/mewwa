import { getSettings } from "@/lib/data";
import { ContactForm } from "./contact-form";
import { normalizeWhatsAppNumber } from "@/lib/constants";
import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSettings();

  const whatsappNumber = normalizeWhatsAppNumber(settings?.whatsapp_number);
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to know more about your products.")}`;
  const phone = settings?.phone ?? "+92-300-1234567";
  const email = settings?.email ?? "hello@qaaq.pk";
  const address = settings?.address ?? "Gilgit-Baltistan, Pakistan";

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 28px 110px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1px",
          background: "#E7E1D7",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* ── Left dark panel ── */}
        <div style={{ background: "#1A1512", padding: 52 }}>
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
            Talk to us
          </p>

          <h1
            style={{
              fontSize: "clamp(30px, 3vw, 44px)",
              fontWeight: 800,
              color: "#fff",
              letterSpacing: "-.04em",
              lineHeight: 1.1,
              marginTop: 16,
            }}
          >
            WhatsApp is{" "}
            <span
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontStyle: "italic",
                fontWeight: 400,
              }}
            >
              fastest.
            </span>
          </h1>

          <p
            style={{
              fontSize: 15.5,
              lineHeight: 1.7,
              color: "rgba(255,255,255,.6)",
              marginTop: 16,
            }}
          >
            Drop us a message on WhatsApp for the quickest reply&mdash;we
            typically respond within minutes during business hours.
          </p>

          {/* WhatsApp CTA */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              height: 52,
              padding: "0 28px",
              marginTop: 28,
              background: "#1FA855",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 2,
              textDecoration: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            <MessageCircle size={18} />
            {phone}
          </a>

          {/* Contact rows */}
          <div
            style={{
              marginTop: 40,
              borderTop: "1px solid rgba(255,255,255,.1)",
            }}
          >
            {/* Email */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 0",
                borderBottom: "1px solid rgba(255,255,255,.1)",
              }}
            >
              <Mail size={16} style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }} />
              <a
                href={`mailto:${email}`}
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,.7)",
                  textDecoration: "none",
                }}
              >
                {email}
              </a>
            </div>

            {/* Phone */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 0",
                borderBottom: "1px solid rgba(255,255,255,.1)",
              }}
            >
              <Phone size={16} style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }} />
              <a
                href={`tel:${phone}`}
                style={{
                  fontSize: 14,
                  color: "rgba(255,255,255,.7)",
                  textDecoration: "none",
                }}
              >
                {phone}
              </a>
            </div>

            {/* Location */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "18px 0",
              }}
            >
              <MapPin size={16} style={{ color: "rgba(255,255,255,.4)", flexShrink: 0 }} />
              <span style={{ fontSize: 14, color: "rgba(255,255,255,.7)" }}>
                {address}
              </span>
            </div>
          </div>

          {/* Social links */}
          <div style={{ display: "flex", gap: 20, marginTop: 32 }}>
            <a
              href="#"
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(255,255,255,.5)",
                textDecoration: "none",
              }}
            >
              Instagram
            </a>
            <a
              href="#"
              style={{
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: ".1em",
                color: "rgba(255,255,255,.5)",
                textDecoration: "none",
              }}
            >
              Facebook
            </a>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div style={{ background: "#FBF9F5", padding: "52px 52px 52px 52px" }}>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
