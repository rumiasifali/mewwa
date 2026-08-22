import type { Product } from "@/types";

// Build-time fallback only — the live value comes from site_settings.whatsapp_number
export const WHATSAPP_NUMBER = "923427059590";

/**
 * Normalizes an admin-entered Pakistani phone number to the digits-only
 * international form wa.me requires: "0342-7059590" → "923427059590".
 */
export function normalizeWhatsAppNumber(raw: string | null | undefined): string {
  const digits = (raw || "").replace(/\D/g, "");
  if (!digits) return WHATSAPP_NUMBER;
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export const SITE_CONFIG = {
  name: "QAAQ",
  tagline: "From the Mountains to Your Doorstep",
  description:
    "Handpicked premium dry fruits and nuts sourced from the finest origins.",
  currency: "PKR",
  whatsapp: WHATSAPP_NUMBER,
  email: "hello@qaaq.pk",
  phone: "+92 300 1234567",
  address: "Pakistan",
  social: {
    instagram: "https://instagram.com/qaaq.pk",
    facebook: "https://facebook.com/qaaq.pk",
  },
};

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Shipping", href: "/shipping" },
  { label: "Contact", href: "/contact" },
] as const;

export function getWhatsAppLink(
  product?: Product,
  weight?: string,
  number: string = WHATSAPP_NUMBER
) {
  const base = `https://wa.me/${number}`;
  if (!product) return `${base}?text=${encodeURIComponent("Hi, I'd like to know more about your products.")}`;
  const message = weight
    ? `Hi, I'd like to order *${product.name}* — ${weight}. Please share the details.`
    : `Hi, I'm interested in *${product.name}*. Please share the details.`;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function formatPrice(price: number, currency = "PKR") {
  return `${currency} ${price.toLocaleString()}`;
}
