"use client";

import { useState } from "react";
import { Star, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitFeedback } from "./actions";
import type { Product } from "@/types";

export function FeedbackForm({ products }: { products: Product[] }) {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(5);
  const [form, setForm] = useState({
    name: "",
    email: "",
    location: "",
    content: "",
    product_id: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await submitFeedback({
        name: form.name,
        email: form.email,
        location: form.location,
        rating,
        content: form.content,
        product_id: form.product_id || null,
      });

      if (!result.success) {
        setError(result.error || "Failed to submit feedback");
        setLoading(false);
        return;
      }

      setSubmitted(true);
      setForm({ name: "", email: "", location: "", content: "", product_id: "" });
      setRating(5);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-32 pb-24">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              Thank You!
            </h1>
            <p className="text-lg text-muted-foreground mb-4">
              Your feedback has been submitted successfully. We appreciate your time and will review it shortly.
            </p>
            <p className="text-muted-foreground mb-8">
              Approved reviews will appear on our website to help other customers discover the quality of QAAQ.
            </p>
            <Button asChild className="rounded-xl">
              <a href="/">Back to Home</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white pt-24 sm:pt-32 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider mb-3">
            Share Your Experience
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Leave Your Feedback
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            We'd love to hear about your experience with QAAQ. Your honest feedback helps us improve and helps other customers make the right choice.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg border border-border/50 p-8 sm:p-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name & Email */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Your Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Sarah Khan"
                  required
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="sarah@example.com"
                  required
                  className="rounded-lg"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">City / Location *</Label>
              <Input
                id="location"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="Islamabad, Pakistan"
                required
                className="rounded-lg"
              />
            </div>

            {/* Product (Optional) */}
            {products.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="product">Product (Optional)</Label>
                <select
                  id="product"
                  value={form.product_id}
                  onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select a product (optional)</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Link your review to a specific product
                </p>
              </div>
            )}

            {/* Rating */}
            <div className="space-y-2">
              <Label>Your Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} out of 5 stars
                </span>
              </div>
            </div>

            {/* Review */}
            <div className="space-y-2">
              <Label htmlFor="content">Your Review *</Label>
              <Textarea
                id="content"
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                placeholder="Share your experience with QAAQ's products. What did you like? How was the quality, packaging, and delivery?"
                rows={6}
                required
                className="rounded-lg resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 20 characters. Please be honest and helpful!
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 text-destructive text-sm">
                {error}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => window.history.back()}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="rounded-xl flex-1"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                Submit Review
              </Button>
            </div>
          </form>

          {/* Info Box */}
          <div className="mt-8 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-900">
              <strong>📝 Note:</strong> All reviews are moderated before being published on our website. This helps us maintain quality and authenticity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
