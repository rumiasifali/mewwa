import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { SiteSettingsProvider } from "@/contexts/site-settings-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartSync } from "@/components/cart/cart-sync";
import { Toaster } from "sonner";
import { getSettings } from "@/lib/data";
import { normalizeWhatsAppNumber } from "@/lib/constants";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();

  return (
    <SiteSettingsProvider
      value={{
        whatsappNumber: settings?.whatsapp_number || undefined,
        flatRate: settings?.flat_rate != null ? Number(settings.flat_rate) : undefined,
        freeShippingThreshold:
          settings?.free_shipping_threshold != null
            ? Number(settings.free_shipping_threshold)
            : undefined,
        announcementText: settings?.announcement_text || undefined,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <AnnouncementBar />
          <SiteHeader />
          <AuthModal />
          <CartDrawer />
          <CartSync />
          <Toaster
            position="bottom-left"
            toastOptions={{
              style: {
                background: "#1A1512",
                color: "#fff",
                border: "none",
                borderRadius: 2,
                fontFamily: "Geist, sans-serif",
                fontSize: 13,
              },
            }}
          />
          <main className="flex-1 pt-[66px] sm:pt-[100px]">
            {children}
          </main>
          <Footer
            whatsappNumber={
              settings?.whatsapp_number
                ? normalizeWhatsAppNumber(settings.whatsapp_number)
                : undefined
            }
          />
        </CartProvider>
      </AuthProvider>
    </SiteSettingsProvider>
  );
}
