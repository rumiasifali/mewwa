"use client";

import { useState } from "react";
import { subscribeToNewsletter } from "./actions";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        setSuccessMessage(result.message);
      } else {
        setError(result.message);
      }
    } catch {
      setError("Something went wrong. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  if (successMessage) {
    return (
      <p
        style={{
          margin: 0,
          fontSize: 14.5,
          lineHeight: 1.65,
          fontWeight: 600,
          color: "#1A1512",
        }}
      >
        {successMessage} We&rsquo;ll write when the next lot lands.
      </p>
    );
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
        <input
          type="email"
          placeholder="you@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
          aria-label="Email address"
          style={{
            flex: 1,
            height: 50,
            padding: "0 14px",
            border: "1px solid #DCD3C5",
            background: "#fff",
            borderRadius: 2,
            fontSize: 14,
            fontFamily: "Geist, sans-serif",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            cursor: loading ? "default" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            height: 50,
            padding: "0 22px",
            background: "#1A1512",
            color: "#fff",
            fontSize: 13.5,
            fontWeight: 600,
            borderRadius: 2,
            border: "none",
            fontFamily: "inherit",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Subscribing…" : "Subscribe"}
        </button>
      </form>
      {error && (
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 13,
            lineHeight: 1.5,
            color: "#A03C2E",
          }}
        >
          {error}
        </p>
      )}
    </div>
  );
}
