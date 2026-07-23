"use client";

import { AnimatedSection, fadeUp, staggerContainer, motion } from "@/components/shared/motion";
import { Truck, Globe, Package, Clock, Shield, CreditCard } from "lucide-react";

const domesticZones = [
  { zone: "Same City", time: "1-2 days", cost: "PKR 200" },
  { zone: "Major Cities", time: "2-3 days", cost: "PKR 300" },
  { zone: "Other Areas", time: "3-5 days", cost: "PKR 350-450" },
];

const internationalZones = [
  { zone: "UAE & Gulf", time: "5-7 days", cost: "Contact us" },
  { zone: "UK & Europe", time: "7-12 days", cost: "Contact us" },
  { zone: "USA & Canada", time: "10-14 days", cost: "Contact us" },
  { zone: "Other Countries", time: "10-21 days", cost: "Contact us" },
];

export default function ShippingPage() {
  return (
    <div className="pt-24 sm:pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection>
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            Shipping Info
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Delivery & Shipping
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl">
            We ship across Pakistan and internationally. Every order is packed
            fresh with protective packaging to ensure your dry fruits arrive in
            perfect condition.
          </p>
        </AnimatedSection>

        {/* Domestic */}
        <AnimatedSection className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Truck className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Domestic Shipping</h2>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="grid grid-cols-3 p-4 bg-secondary/50 text-sm font-medium text-muted-foreground">
              <span>Zone</span>
              <span>Delivery Time</span>
              <span>Shipping Cost</span>
            </div>
            {domesticZones.map((z) => (
              <div
                key={z.zone}
                className="grid grid-cols-3 p-4 border-t border-border/50 text-sm"
              >
                <span className="font-medium">{z.zone}</span>
                <span className="text-muted-foreground">{z.time}</span>
                <span className="font-medium">{z.cost}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Cash on Delivery (COD) is available for all domestic orders.
            Free shipping on orders above PKR 5,000.
          </p>
        </AnimatedSection>

        {/* International */}
        <AnimatedSection className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">International Shipping</h2>
          </div>
          <div className="rounded-2xl bg-card border border-border/50 overflow-hidden">
            <div className="grid grid-cols-3 p-4 bg-secondary/50 text-sm font-medium text-muted-foreground">
              <span>Destination</span>
              <span>Estimated Time</span>
              <span>Cost</span>
            </div>
            {internationalZones.map((z) => (
              <div
                key={z.zone}
                className="grid grid-cols-3 p-4 border-t border-border/50 text-sm"
              >
                <span className="font-medium">{z.zone}</span>
                <span className="text-muted-foreground">{z.time}</span>
                <span className="font-medium">{z.cost}</span>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            International shipping costs depend on weight and destination. WhatsApp
            us for an exact quote before ordering.
          </p>
        </AnimatedSection>

        {/* Features */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {[
            {
              icon: Package,
              title: "Secure Packaging",
              description:
                "Every order is packed in sealed, food-grade pouches with bubble wrap and rigid boxes for transit protection.",
            },
            {
              icon: Clock,
              title: "Same-Day Dispatch",
              description:
                "Orders placed before 2 PM are dispatched the same day. We don't let your order sit around.",
            },
            {
              icon: Shield,
              title: "Freshness Guarantee",
              description:
                "Not satisfied with the freshness? We'll replace it or refund you — no questions asked.",
            },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              variants={fadeUp}
              custom={i}
              className="p-6 rounded-2xl bg-card border border-border/50"
            >
              <f.icon className="w-6 h-6 text-primary mb-4" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
