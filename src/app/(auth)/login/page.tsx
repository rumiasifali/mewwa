"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/admin";

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(redirectTo);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen" style={{ fontFamily: "var(--font-sans)" }}>
      {/* ── Left panel ── */}
      <div
        className="hidden lg:flex flex-1 flex-col justify-center"
        style={{
          backgroundColor: "#1A1512",
          padding: 64,
          minHeight: "100vh",
        }}
      >
        {/* Logo block */}
        <div>
          <div
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-.05em",
              color: "#fff",
              lineHeight: 1,
            }}
          >
            QAAQ
          </div>
          <div
            style={{
              fontSize: 9,
              letterSpacing: ".42em",
              textTransform: "uppercase",
              color: "#7C7268",
              marginTop: 4,
            }}
          >
            Dry Fruits
          </div>
        </div>

        {/* Tagline — pushed to bottom */}
        <div style={{ marginTop: "auto", maxWidth: 360 }}>
          <p
            style={{
              fontFamily: "var(--font-accent)",
              fontSize: 26,
              lineHeight: 1.3,
              color: "#E7C079",
              fontStyle: "italic",
            }}
          >
            &ldquo;From the mountains, weighed and sealed the day you order.&rdquo;
          </p>
          <p
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,.4)",
              marginTop: 16,
            }}
          >
            &mdash; QAAQ
          </p>
        </div>

        {/* Decorative dot */}
        <div
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            backgroundColor: "#C8922E",
            marginTop: 32,
          }}
        />
      </div>

      {/* ── Right panel ── */}
      <div
        className="flex-1 flex flex-col justify-center items-center px-6"
        style={{ backgroundColor: "#FBF9F5", minHeight: "100vh" }}
      >
        <div style={{ width: "100%", maxWidth: 480 }}>
          {/* Mobile logo */}
          <div className="lg:hidden" style={{ marginBottom: 40 }}>
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                letterSpacing: "-.05em",
                color: "#1A1512",
                lineHeight: 1,
              }}
            >
              QAAQ
            </div>
            <div
              style={{
                fontSize: 9,
                letterSpacing: ".42em",
                textTransform: "uppercase",
                color: "#7C7268",
                marginTop: 4,
              }}
            >
              Dry Fruits
            </div>
          </div>

          <h1
            style={{
              fontSize: 32,
              fontWeight: 800,
              letterSpacing: "-.04em",
              color: "#1A1512",
              lineHeight: 1,
            }}
          >
            Sign in
          </h1>
          <p style={{ fontSize: 14, color: "#7C7268", marginTop: 8 }}>
            Admin access only
          </p>

          <form onSubmit={handleLogin} style={{ marginTop: 32 }}>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  fontSize: 10.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#4A4139",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@qaaq.pk"
                style={{
                  display: "block",
                  width: "100%",
                  height: 48,
                  border: "1px solid #DCD3C5",
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  fontSize: 15,
                  padding: "0 16px",
                  marginTop: 8,
                  outline: "none",
                  color: "#1A1512",
                }}
              />
            </div>

            {/* Password */}
            <div style={{ marginTop: 20 }}>
              <label
                htmlFor="password"
                style={{
                  display: "block",
                  fontSize: 10.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "#4A4139",
                }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter password"
                style={{
                  display: "block",
                  width: "100%",
                  height: 48,
                  border: "1px solid #DCD3C5",
                  backgroundColor: "#fff",
                  borderRadius: 2,
                  fontSize: 15,
                  padding: "0 16px",
                  marginTop: 8,
                  outline: "none",
                  color: "#1A1512",
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  backgroundColor: "#F7EBDA",
                  color: "#8A4A12",
                  padding: "12px 16px",
                  fontSize: 13,
                  marginTop: 16,
                  borderRadius: 2,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: 52,
                backgroundColor: "#1A1512",
                color: "#fff",
                fontSize: 15,
                fontWeight: 600,
                borderRadius: 2,
                border: "none",
                marginTop: 24,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity .15s",
              }}
            >
              {loading && (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ marginRight: 8, animation: "spin 1s linear infinite" }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="rgba(255,255,255,.3)"
                    strokeWidth="2"
                  />
                  <path
                    d="M14 8a6 6 0 0 0-6-6"
                    stroke="#fff"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
              Sign In
            </button>
          </form>

          {/* Back link */}
          <Link
            href="/"
            style={{
              display: "inline-block",
              fontSize: 13,
              color: "#7C7268",
              marginTop: 32,
              textDecoration: "none",
            }}
          >
            &larr; Back to site
          </Link>
        </div>
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#FBF9F5" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 16 16"
            fill="none"
            style={{ animation: "spin 1s linear infinite" }}
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="#DCD3C5"
              strokeWidth="2"
            />
            <path
              d="M14 8a6 6 0 0 0-6-6"
              stroke="#7C7268"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
