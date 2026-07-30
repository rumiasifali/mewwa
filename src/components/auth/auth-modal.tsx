"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import { createClient } from "@/lib/supabase/client";
import { X, Eye, EyeOff } from "lucide-react";

const C = {
  ink: "#1A1512",
  ink2: "#2A211A",
  gold: "#C8922E",
  paper: "#FBF9F5",
  line: "#E7E1D7",
  line3: "#DCD3C5",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
  warnBg: "#F7EBDA",
  warnText: "#6B3A12",
  warnBorder: "#B4551F",
  okBg: "#E6EFE0",
  okColor: "#2E5A22",
} as const;

export function AuthModal() {
  const { authOpen, authView, closeAuthModal, setAuthView } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [waUpdates, setWaUpdates] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const supabase = createClient();

  const resetForm = useCallback(() => {
    setEmail("");
    setPassword("");
    setFullName("");
    setShowPassword(false);
    setError("");
    setLoading(false);
  }, []);

  const switchView = (view: "login" | "signup" | "forgot" | "sent") => {
    setError("");
    setAuthView(view);
  };

  const handleClose = () => {
    resetForm();
    closeAuthModal();
  };

  // ── Sign In ──
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    resetForm();
    closeAuthModal();
  };

  // ── Sign Up ──
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);

    const { error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          wa_updates: waUpdates,
        },
      },
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    resetForm();
    closeAuthModal();
  };

  // ── Google OAuth ──
  const handleGoogle = async () => {
    setError("");
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  // ── Forgot Password ──
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setSentEmail(email);
    setLoading(false);
    switchView("sent");
  };

  if (!authOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: 80,
      }}
    >
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(20,16,13,.55)",
          backdropFilter: "blur(3px)",
          WebkitBackdropFilter: "blur(3px)",
          animation: "qaaq-fade .18s both",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 432,
          maxHeight: "90vh",
          overflowY: "auto",
          background: C.paper,
          border: `1px solid ${C.line3}`,
          boxShadow: "0 40px 90px -30px rgba(0,0,0,.55)",
          animation: "qaaq-rise .22s both",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "17px 22px",
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ lineHeight: 1 }}>
            <div
              style={{
                fontSize: 19,
                fontWeight: 800,
                letterSpacing: "-.05em",
                color: C.ink,
              }}
            >
              QAAQ
            </div>
            <div
              style={{
                fontSize: 7.5,
                letterSpacing: ".42em",
                textTransform: "uppercase",
                color: C.muted,
                fontWeight: 600,
                marginTop: 3,
              }}
            >
              Dry Fruits
            </div>
          </div>
          <button
            onClick={handleClose}
            style={{
              width: 30,
              height: 30,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "none",
              border: `1px solid ${C.line}`,
              borderRadius: 2,
              cursor: "pointer",
              color: C.muted,
            }}
          >
            <X style={{ width: 18, height: 18 }} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "24px 22px 28px" }}>
          {/* ── ERROR BAND ── */}
          {error && (
            <div
              style={{
                display: "flex",
                gap: 10,
                padding: "12px 14px",
                background: C.warnBg,
                borderLeft: `2px solid ${C.warnBorder}`,
                marginBottom: 18,
                fontSize: 12.5,
                color: C.warnText,
                lineHeight: 1.5,
              }}
            >
              {error}
            </div>
          )}

          {/* ═══════ LOGIN VIEW ═══════ */}
          {authView === "login" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 750,
                  letterSpacing: "-.03em",
                  color: C.ink,
                }}
              >
                Welcome back
              </h2>

              {/* Google — first */}
              <button
                type="button"
                onClick={handleGoogle}
                className="qaaq-press"
                style={googleButtonStyle}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span
                  style={{ flex: 1, height: 1, background: C.line }}
                />
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.faint }}>OR</span>
                <span
                  style={{ flex: 1, height: 1, background: C.line }}
                />
              </div>

              <form
                onSubmit={handleSignIn}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    style={inputStyle}
                  />
                </div>
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <label style={labelStyle}>Password</label>
                    <button
                      type="button"
                      onClick={() => switchView("forgot")}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 11.5,
                        color: C.muted,
                        cursor: "pointer",
                        borderBottom: `1px solid ${C.gold}`,
                        padding: 0,
                        fontFamily: "inherit",
                      }}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div style={{ position: "relative", marginTop: 8 }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      required
                      style={inputStyle}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 12,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: C.faint,
                        padding: 0,
                        display: "flex",
                      }}
                    >
                      {showPassword ? (
                        <EyeOff style={{ width: 16, height: 16 }} />
                      ) : (
                        <Eye style={{ width: 16, height: 16 }} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Keep signed in */}
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    cursor: "pointer",
                    userSelect: "none",
                  }}
                >
                  <span
                    onClick={() => setKeepSignedIn(!keepSignedIn)}
                    style={{
                      width: 15,
                      height: 15,
                      borderRadius: 2,
                      border: `1px solid ${keepSignedIn ? C.ink : C.line3}`,
                      background: keepSignedIn ? C.ink : "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {keepSignedIn && (
                      <svg
                        width="9"
                        height="9"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="3.6"
                      >
                        <path d="M4 12.5 9.5 18 20 6.5" />
                      </svg>
                    )}
                  </span>
                  <span style={{ fontSize: 12.5, color: C.body }}>
                    Keep me signed in
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="qaaq-press"
                  style={primaryButtonStyle(loading)}
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>
              </form>

              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: C.muted,
                  textAlign: "center",
                }}
              >
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchView("signup")}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12.5,
                    color: C.ink,
                    fontWeight: 600,
                    padding: 0,
                    fontFamily: "inherit",
                    borderBottom: `1px solid ${C.gold}`,
                  }}
                >
                  Create account
                </button>
              </p>
            </div>
          )}

          {/* ═══════ SIGNUP VIEW ═══════ */}
          {authView === "signup" && (
            <form
              onSubmit={handleSignUp}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 22,
                  fontWeight: 750,
                  letterSpacing: "-.03em",
                  color: C.ink,
                }}
              >
                Create account
              </h2>
              <div>
                <label style={labelStyle}>Full name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ayesha Rahman"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <div style={{ position: "relative", marginTop: 8 }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    required
                    style={inputStyle}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 12,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: C.faint,
                      padding: 0,
                      display: "flex",
                    }}
                  >
                    {showPassword ? (
                      <EyeOff style={{ width: 16, height: 16 }} />
                    ) : (
                      <Eye style={{ width: 16, height: 16 }} />
                    )}
                  </button>
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: 11.5,
                    color: C.muted2,
                    lineHeight: 1.5,
                  }}
                >
                  Eight characters minimum, with at least one number.
                </p>
              </div>

              {/* WhatsApp opt-in */}
              <label
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 9,
                  cursor: "pointer",
                  userSelect: "none",
                }}
              >
                <span
                  onClick={() => setWaUpdates(!waUpdates)}
                  style={{
                    width: 15,
                    height: 15,
                    borderRadius: 2,
                    border: `1px solid ${waUpdates ? C.ink : C.line3}`,
                    background: waUpdates ? C.ink : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {waUpdates && (
                    <svg
                      width="9"
                      height="9"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="3.6"
                    >
                      <path d="M4 12.5 9.5 18 20 6.5" />
                    </svg>
                  )}
                </span>
                <span style={{ fontSize: 12.5, color: C.body }}>
                  Get order updates and harvest notes on WhatsApp
                </span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="qaaq-press"
                style={primaryButtonStyle(loading)}
              >
                {loading ? "Creating account..." : "Create account"}
              </button>

              {/* Divider */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                }}
              >
                <span
                  style={{ flex: 1, height: 1, background: C.line }}
                />
                <span style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: ".1em", color: C.faint }}>OR</span>
                <span
                  style={{ flex: 1, height: 1, background: C.line }}
                />
              </div>

              <button
                type="button"
                onClick={handleGoogle}
                className="qaaq-press"
                style={googleButtonStyle}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  color: C.muted2,
                  lineHeight: 1.6,
                  textAlign: "center",
                }}
              >
                By creating an account you agree to our terms and privacy
                policy.
              </p>
            </form>
          )}

          {/* ═══════ FORGOT VIEW ═══════ */}
          {authView === "forgot" && (
            <form
              onSubmit={handleForgotPassword}
              style={{ display: "flex", flexDirection: "column", gap: 16 }}
            >
              <button
                type="button"
                onClick={() => switchView("login")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  color: C.muted,
                  padding: 0,
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                }}
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 12H5M11 6l-6 6 6 6" />
                </svg>
                Back to sign in
              </button>
              <div>
                <div
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".32em",
                    textTransform: "uppercase",
                    color: C.gold,
                    fontWeight: 700,
                  }}
                >
                  Password reset
                </div>
                <h2
                  style={{
                    margin: "12px 0 0",
                    fontSize: 26,
                    fontWeight: 750,
                    letterSpacing: "-.035em",
                    lineHeight: 1.1,
                  }}
                >
                  Reset your password
                </h2>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 13.5,
                    color: C.muted,
                    lineHeight: 1.55,
                  }}
                >
                  Enter the email on your account and we&apos;ll send a reset
                  link.
                </p>
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  required
                  style={inputStyle}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="qaaq-press"
                style={primaryButtonStyle(loading)}
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  color: C.muted2,
                  lineHeight: 1.5,
                }}
              >
                Links expire 60 minutes after we send them.
              </p>
            </form>
          )}

          {/* ═══════ SENT VIEW ═══════ */}
          {authView === "sent" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 16,
                alignItems: "flex-start",
              }}
            >
              <span
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: C.okBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={C.okColor}
                  strokeWidth="2.6"
                >
                  <path d="M4 12.5 9.5 18 20 6.5" />
                </svg>
              </span>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 26,
                    fontWeight: 750,
                    letterSpacing: "-.035em",
                    lineHeight: 1.1,
                  }}
                >
                  Check your inbox
                </h2>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontSize: 14,
                    color: C.body,
                    lineHeight: 1.65,
                  }}
                >
                  We&apos;ve sent a password reset link to{" "}
                  <strong>{sentEmail}</strong>. It expires in 60 minutes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  switchView("forgot");
                  setEmail(sentEmail);
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12.5,
                  color: C.muted,
                  padding: 0,
                  fontFamily: "inherit",
                  borderBottom: `1px solid ${C.gold}`,
                }}
              >
                Wrong email? Try again
              </button>
              <button
                type="button"
                onClick={() => switchView("login")}
                className="qaaq-press"
                style={{
                  ...primaryButtonStyle(false),
                  width: "100%",
                }}
              >
                Back to sign in
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Shared styles ──

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".16em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#4A4139",
};

const inputStyle: React.CSSProperties = {
  marginTop: 8,
  width: "100%",
  height: 46,
  padding: "0 13px",
  border: "1px solid #DCD3C5",
  background: "#fff",
  borderRadius: 2,
  fontSize: 14.5,
  fontFamily: "Geist, sans-serif",
  outline: "none",
  color: "#1A1512",
  boxSizing: "border-box",
};

const primaryButtonStyle = (disabled: boolean): React.CSSProperties => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: 50,
  background: disabled ? "#9A9086" : "#1A1512",
  color: "#fff",
  fontSize: 14.5,
  fontWeight: 600,
  borderRadius: 2,
  border: "none",
  cursor: disabled ? "not-allowed" : "pointer",
  fontFamily: "inherit",
});

const googleButtonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  height: 48,
  background: "#fff",
  color: "#1A1512",
  fontSize: 14.5,
  fontWeight: 600,
  borderRadius: 2,
  border: "1px solid #DCD3C5",
  cursor: "pointer",
  fontFamily: "inherit",
};

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}
