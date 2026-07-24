"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { NAV_LINKS, SITE_CONFIG } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHome = pathname === "/";

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "glass shadow-sm"
          : isHome
            ? "bg-transparent"
            : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="relative z-10 group">
            <span
              className={cn(
                "text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-300",
                scrolled || !isHome
                  ? "text-foreground"
                  : "text-white"
              )}
            >
              QAAQ
            </span>
            <span
              className={cn(
                "block text-[10px] uppercase tracking-[0.3em] transition-colors duration-300",
                scrolled || !isHome
                  ? "text-muted-foreground"
                  : "text-white/70"
              )}
            >
              Premium Dry Fruits
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "relative px-4 py-2 text-sm font-medium transition-colors duration-300 rounded-full",
                  pathname === link.href
                    ? scrolled || !isHome
                      ? "text-foreground"
                      : "text-white"
                    : scrolled || !isHome
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-white/70 hover:text-white"
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className={cn(
                      "absolute inset-0 rounded-full -z-10",
                      scrolled || !isHome
                        ? "bg-accent"
                        : "bg-white/10"
                    )}
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            ))}
          </div>

          {/* CTA + Mobile */}
          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              className={cn(
                "hidden sm:inline-flex rounded-full font-medium transition-all duration-300",
                scrolled || !isHome
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-white text-foreground hover:bg-white/90"
              )}
            >
              <Link href="/products">
                <ShoppingBag className="w-4 h-4 mr-2" />
                Shop Now
              </Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger
                render={
                  <button
                    className={cn(
                      "md:hidden p-2 rounded-full transition-colors",
                      scrolled || !isHome
                        ? "text-foreground hover:bg-accent"
                        : "text-white hover:bg-white/10"
                    )}
                  />
                }
              >
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 p-0">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <span className="text-2xl font-bold tracking-tight">QAAQ</span>
                  </div>
                  <nav className="flex-1 p-6">
                    <div className="space-y-1">
                      {NAV_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center px-4 py-3 rounded-xl text-base font-medium transition-colors",
                            pathname === link.href
                              ? "bg-accent text-foreground"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </nav>
                  <div className="p-6 border-t">
                    <Button asChild className="w-full rounded-full" size="lg">
                      <Link href="/products" onClick={() => setOpen(false)}>
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Shop Now
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </nav>
    </motion.header>
  );
}
