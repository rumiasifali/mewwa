import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { AuthProvider } from "@/contexts/auth-context";
import { CartProvider } from "@/contexts/cart-context";
import { AuthModal } from "@/components/auth/auth-modal";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { CartSync } from "@/components/cart/cart-sync";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
        <main className="flex-1" style={{ paddingTop: 100 }}>
          {children}
        </main>
        <Footer />
      </CartProvider>
    </AuthProvider>
  );
}
