"use client";

import { createContext, useContext } from "react";
import { WHATSAPP_NUMBER, normalizeWhatsAppNumber } from "@/lib/constants";

export interface SiteSettingsValue {
  whatsappNumber: string;
  flatRate: number;
  freeShippingThreshold: number | null;
  announcementText: string | null;
}

const DEFAULTS: SiteSettingsValue = {
  whatsappNumber: WHATSAPP_NUMBER,
  flatRate: 0,
  freeShippingThreshold: null,
  announcementText: null,
};

const SiteSettingsContext = createContext<SiteSettingsValue>(DEFAULTS);

/**
 * Client-side access to site_settings values fetched once, server-side,
 * in the public layout. Constants remain the build-time fallback.
 */
export function SiteSettingsProvider({
  value,
  children,
}: {
  value: Partial<SiteSettingsValue>;
  children: React.ReactNode;
}) {
  const merged: SiteSettingsValue = {
    whatsappNumber: value.whatsappNumber
      ? normalizeWhatsAppNumber(value.whatsappNumber)
      : DEFAULTS.whatsappNumber,
    flatRate: value.flatRate ?? DEFAULTS.flatRate,
    freeShippingThreshold: value.freeShippingThreshold ?? DEFAULTS.freeShippingThreshold,
    announcementText: value.announcementText ?? DEFAULTS.announcementText,
  };
  return (
    <SiteSettingsContext.Provider value={merged}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}
