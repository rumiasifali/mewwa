import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: {
    default: "QAAQ | Premium Dry Fruits & Nuts",
    template: "%s | QAAQ",
  },
  description:
    "Handpicked premium dry fruits and nuts sourced from the finest origins. From the mountains to your doorstep — quality you can taste.",
  keywords: [
    "dry fruits",
    "nuts",
    "almonds",
    "cashews",
    "pistachios",
    "premium",
    "Pakistan",
    "online",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "QAAQ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
}
