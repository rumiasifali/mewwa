"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const C = {
  ink: "#1A1512",
  ink2: "#2A211A",
  gold: "#C8922E",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
  line: "#E7E1D7",
  line3: "#DCD3C5",
  paper: "#FBF9F5",
  paper2: "#F5F1EA",
  warnBg: "#F7EBDA",
  warnText: "#6B3A12",
  warnBorder: "#B4551F",
  okBg: "#E6EFE0",
  okColor: "#2E5A22",
  okDark: "#4E7A3E",
} as const;

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // Password strength
  const rules = useMemo(() => {
    return [
      { label: "At least 8 characters", pass: password.length >= 8 },
      { label: "Contains a number", pass: /\d/.test(password) },
      { label: "Contains a symbol", pass: /[^a-zA-Z0-9]/.test(password) },
    ];
  }, [password]);

  const passCount = rules.filter((r) => r.pass).length;
  const strengthLabel =
    passCount === 0 ? "" : passCount === 1 ? "Weak" : passCount === 2 ? "Fair" : "Strong";
  const strengthColor =
    passCount <= 1 ? C.warnBorder : passCount === 2 ? C.gold : C.okDark;
  const barColors = [
    passCount >= 1 ? strengthColor : C.line,
    passCount >= 2 ? strengthColor : C.line,
    passCount >= 3 ? strengthColor : C.line,
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    if (passCount < 2) {
      setError("Password is too weak.");
      return;
    }

    setLoading(true);

    const { error: err } = await supabase.auth.updateUser({
      password,
    });

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    // Sign out other sessions
    await supabase.auth.signOut();
    setDone(true);
    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: C.paper2,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "150px 20px 90px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 424,
          background: C.paper,
          border: `1px solid ${C.line3}`,
          boxShadow: "0 24px 60px -34px rgba(26,21,18,.35)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "26px 30px 20px",
            borderBottom: `1px solid ${C.line}`,
            display: "flex",
            flexDirection: "column",
            lineHeight: 1,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: "-.05em",
            }}
          >
            QAAQ
          </span>
          <span
            style={{
              fontSize: 8,
              letterSpacing: ".42em",
              textTransform: "uppercase",
              color: C.muted,
              fontWeight: 600,
              marginTop: 4,
            }}
          >
            Dry Fruits
          </span>
        </div>

        {!done ? (
          <form
            onSubmit={handleSubmit}
            style={{
              padding: "26px 30px 30px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
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
              <h1
                style={{
                  margin: "12px 0 0",
                  fontSize: 28,
                  fontWeight: 750,
                  letterSpacing: "-.035em",
                  lineHeight: 1.1,
                }}
              >
                Set new password
              </h1>
            </div>

            {error && (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  padding: "12px 14px",
                  background: C.warnBg,
                  borderLeft: `2px solid ${C.warnBorder}`,
                  fontSize: 12.5,
                  color: C.warnText,
                  lineHeight: 1.5,
                }}
              >
                {error}
              </div>
            )}

            {/* New password */}
            <div>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                style={inputStyle}
              />
              {/* Strength meter */}
              {password.length > 0 && (
                <>
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        gap: 4,
                      }}
                    >
                      {barColors.map((bg, i) => (
                        <span
                          key={i}
                          style={{
                            flex: 1,
                            height: 3,
                            background: bg,
                            transition: "background .25s",
                          }}
                        />
                      ))}
                    </div>
                    <span
                      style={{
                        fontSize: 11,
                        letterSpacing: ".1em",
                        textTransform: "uppercase",
                        fontWeight: 700,
                        color: strengthColor,
                      }}
                    >
                      {strengthLabel}
                    </span>
                  </div>
                  <div
                    style={{
                      marginTop: 11,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                    }}
                  >
                    {rules.map((r) => (
                      <div
                        key={r.label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <span
                          style={{
                            width: 13,
                            height: 13,
                            flexShrink: 0,
                            border: `1px solid ${r.pass ? C.okDark : C.line3}`,
                            background: r.pass ? C.okDark : "transparent",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="8"
                            height="8"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={r.pass ? "#fff" : "transparent"}
                            strokeWidth="4"
                          >
                            <path d="M4 12.5 9.5 18 20 6.5" />
                          </svg>
                        </span>
                        <span
                          style={{
                            fontSize: 12.5,
                            color: r.pass ? C.okDark : C.muted,
                          }}
                        >
                          {r.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Confirm password */}
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                required
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="qaaq-press"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                background: loading ? C.muted2 : C.ink,
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 600,
                borderRadius: 2,
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {loading ? "Updating..." : "Update password"}
            </button>

            <p
              style={{
                margin: 0,
                fontSize: 11.5,
                color: C.muted2,
                lineHeight: 1.6,
              }}
            >
              Updating signs you out on every other device.
            </p>
          </form>
        ) : (
          /* Success state */
          <div
            style={{
              padding: "34px 30px 32px",
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
              <h1
                style={{
                  margin: 0,
                  fontSize: 28,
                  fontWeight: 750,
                  letterSpacing: "-.035em",
                  lineHeight: 1.1,
                }}
              >
                Password updated
              </h1>
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 14,
                  lineHeight: 1.65,
                  color: C.body,
                }}
              >
                You&apos;re signed out everywhere else. Use the new password
                from here on.
              </p>
            </div>
            <button
              onClick={() => router.push("/login")}
              className="qaaq-press"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: 50,
                background: C.ink,
                color: "#fff",
                fontSize: 14.5,
                fontWeight: 600,
                borderRadius: 2,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Go to login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

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
  height: 48,
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
