import Link from "next/link";
import { SITE_CONFIG } from "@/lib/constants";

const footerLinks = {
  shop: [
    { label: "All products", href: "/products" },
    { label: "Nuts", href: "/products?category=nuts" },
    { label: "Dried fruits", href: "/products?category=dried-fruits" },
    { label: "Seeds", href: "/products?category=seeds" },
    { label: "Gift boxes", href: "/products?category=gift-boxes" },
  ],
  company: [
    { label: "Origins", href: "/about" },
    { label: "Journal", href: "/blog" },
    { label: "Contact", href: "/contact" },
    { label: "Leave a review", href: "/feedback" },
  ],
  orders: [
    { label: "Your bag", href: "/cart" },
    { label: "Track an order", href: "/contact" },
    { label: "Build a gift box", href: "/products?category=gift-boxes" },
    { label: "Shipping & delivery", href: "/shipping" },
  ],
  help: [
    { label: "Shipping & delivery", href: "/shipping" },
    { label: "Storage guide", href: "/blog" },
    { label: "Bulk & wholesale", href: "/contact" },
    { label: "Lab reports", href: "/contact" },
  ],
};

const socialIcons = [
  { label: "IG", href: SITE_CONFIG.social.instagram },
  { label: "FB", href: SITE_CONFIG.social.facebook },
  { label: "WA", href: "https://wa.me/923001234567" },
];

export function Footer() {
  return (
    <footer style={{ background: "#1A1512", color: "#EDE7DC" }}>
      {/* Main footer */}
      <div
        style={{ maxWidth: "1400px", margin: "0 auto", padding: "64px 28px 0" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.5fr repeat(4,1fr)",
            gap: "36px",
          }}
          className="footer-grid"
        >
          {/* Brand */}
          <div>
            <Link href="/" className="inline-block">
              <span style={{ fontSize: "28px", fontWeight: 800, letterSpacing: "-.05em", color: "#fff" }}>
                QAAQ
              </span>
              <span
                className="block"
                style={{
                  fontSize: "9px",
                  letterSpacing: ".42em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.42)",
                  fontWeight: 600,
                  marginTop: "4px",
                }}
              >
                Dry Fruits
              </span>
            </Link>
            <p
              style={{
                marginTop: "20px",
                fontSize: "14px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,.55)",
                maxWidth: "290px",
              }}
            >
              Handpicked from five valleys, weighed and sealed the day you order. Nationwide and international shipping from Pakistan.
            </p>
            {/* Social icon tiles */}
            <div style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
              {socialIcons.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: "36px",
                    height: "36px",
                    border: "1px solid rgba(255,255,255,.16)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "2px",
                    fontSize: "11px",
                    letterSpacing: ".06em",
                    color: "#EDE7DC",
                    fontWeight: 600,
                  }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3
              style={{
                fontSize: "10.5px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "rgba(255,255,255,.38)",
              }}
            >
              Shop
            </h3>
            <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {footerLinks.shop.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="qaaq-und"
                  style={{ fontSize: "13.5px", color: "rgba(255,255,255,.7)", width: "fit-content" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Company */}
          <div>
            <h3
              style={{
                fontSize: "10.5px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "rgba(255,255,255,.38)",
              }}
            >
              Company
            </h3>
            <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {footerLinks.company.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="qaaq-und"
                  style={{ fontSize: "13.5px", color: "rgba(255,255,255,.7)", width: "fit-content" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div>
            <h3
              style={{
                fontSize: "10.5px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "rgba(255,255,255,.38)",
              }}
            >
              Orders
            </h3>
            <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {footerLinks.orders.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="qaaq-und"
                  style={{ fontSize: "13.5px", color: "rgba(255,255,255,.7)", width: "fit-content" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Help */}
          <div>
            <h3
              style={{
                fontSize: "10.5px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "rgba(255,255,255,.38)",
              }}
            >
              Help
            </h3>
            <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "11px" }}>
              {footerLinks.help.map((link) => (
                <Link
                  key={link.href + link.label}
                  href={link.href}
                  className="qaaq-und"
                  style={{ fontSize: "13.5px", color: "rgba(255,255,255,.7)", width: "fit-content" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "44px 28px 0" }}>
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,.1)",
            padding: "20px 0 26px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "12px", color: "rgba(255,255,255,.4)" }}>
            &copy; 2026 QAAQ. Registered in Pakistan.
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <span style={{ fontSize: "12px", color: "rgba(255,255,255,.4)" }}>
              Cash on delivery &middot; Bank transfer &middot; Card checkout coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Responsive grid override */}
      <style>{`
        @media (max-width: 1023px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 639px) {
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
