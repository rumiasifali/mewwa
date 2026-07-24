"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MessageCircle, Send } from "lucide-react";

export function ContactForm({ whatsappLink }: { whatsappLink: string }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="rounded-2xl bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
          <Send className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold">Message Sent!</h3>
        <p className="mt-2 text-muted-foreground">
          We&apos;ll get back to you within 24 hours. For faster response, reach
          out on WhatsApp.
        </p>
        <Button
          asChild
          className="mt-6 rounded-full bg-green-600 hover:bg-green-700"
        >
          <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat on WhatsApp
          </a>
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            placeholder="Your name"
            required
            className="h-12 rounded-xl"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            className="h-12 rounded-xl"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="What's this about?"
          required
          className="h-12 rounded-xl"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Tell us more..."
          required
          rows={6}
          className="rounded-xl resize-none"
        />
      </div>
      <Button type="submit" size="lg" className="rounded-full px-8 h-12">
        <Send className="w-4 h-4 mr-2" />
        Send Message
      </Button>
    </form>
  );
}
