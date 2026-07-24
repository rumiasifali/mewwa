import { getSettings } from "@/lib/data";
import { AnimatedSection, slideInLeft, slideInRight } from "@/components/shared/motion";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";
import { ContactForm } from "./contact-form";

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSettings();

  const rawNumber = settings?.whatsapp_number ?? "923001234567";
  // Normalize to international format: strip +, spaces, dashes
  // If starts with 0, replace with country code 92 (Pakistan)
  const whatsappNumber = rawNumber
    .replace(/[\s\-()]/g, "")
    .replace(/^\+/, "")
    .replace(/^0/, "92");
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Hi, I'd like to know more about your products.")}`;
  const phone = settings?.phone ?? "+92 300 1234567";
  const email = settings?.email ?? "hello@qaaq.pk";
  const address = settings?.address ?? "Pakistan";

  return (
    <div className="pt-24 sm:pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection className="max-w-2xl mb-16">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            Get in Touch
          </p>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight">
            Let&apos;s Talk
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Have a question, want to place a bulk order, or just want to say
            hello? We&apos;d love to hear from you.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-16">
          {/* Contact Form */}
          <AnimatedSection variants={slideInLeft} className="lg:col-span-3">
            <ContactForm whatsappLink={whatsappLink} />
          </AnimatedSection>

          {/* Contact Info */}
          <AnimatedSection variants={slideInRight} className="lg:col-span-2">
            <div className="space-y-6">
              {/* WhatsApp Card */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="group block p-6 rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      WhatsApp — Fastest Response
                    </h3>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      Typically replies within minutes
                    </p>
                  </div>
                </div>
              </a>

              {/* Other contacts */}
              <div className="p-6 rounded-2xl bg-card border border-border/50 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Phone</h3>
                    <a
                      href={`tel:${phone}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Email</h3>
                    <a
                      href={`mailto:${email}`}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-sm">Location</h3>
                    <p className="text-muted-foreground">{address}</p>
                  </div>
                </div>
              </div>

              {/* Hours */}
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="font-semibold mb-3">Business Hours</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Monday - Saturday
                    </span>
                    <span className="font-medium">9:00 AM - 9:00 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sunday</span>
                    <span className="font-medium">11:00 AM - 6:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
}
