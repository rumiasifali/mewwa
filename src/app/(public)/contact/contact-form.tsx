"use client";

import { useState } from "react";
import { Star } from "lucide-react";

type Tab = "message" | "review";

export function ContactForm() {
  const [activeTab, setActiveTab] = useState<Tab>("message");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const tabStyle = (tab: Tab): React.CSSProperties => ({
    padding: "14px 20px",
    fontSize: 13.5,
    fontWeight: activeTab === tab ? 600 : 500,
    color: activeTab === tab ? "#1A1512" : "#7C7268",
    background: "none",
    borderTop: "none",
    borderLeft: "none",
    borderRight: "none",
    borderBottomWidth: 2,
    borderBottomStyle: "solid",
    borderBottomColor: activeTab === tab ? "#1A1512" : "transparent",
    cursor: "pointer",
    fontFamily: "inherit",
  });

  const inputStyle: React.CSSProperties = {
    height: 46,
    border: "1px solid #DCD3C5",
    background: "#fff",
    borderRadius: 2,
    fontSize: 14,
    padding: "0 14px",
    width: "100%",
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".16em",
    color: "#2A211A",
    display: "block",
    marginBottom: 6,
  };

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "60px 0" }}>
        <p style={{ fontSize: 18, fontWeight: 700, color: "#1A1512" }}>
          {activeTab === "message" ? "Message sent!" : "Review submitted!"}
        </p>
        <p style={{ fontSize: 14, color: "#7C7268", marginTop: 8 }}>
          Thank you. We&apos;ll be in touch soon.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          style={{
            marginTop: 20,
            height: 44,
            padding: "0 24px",
            background: "#1A1512",
            color: "#fff",
            fontSize: 14,
            fontWeight: 600,
            border: "none",
            borderRadius: 2,
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid #E7E1D7",
        }}
      >
        <button style={tabStyle("message")} onClick={() => setActiveTab("message")}>
          Message
        </button>
        <button style={tabStyle("review")} onClick={() => setActiveTab("review")}>
          Review
        </button>
      </div>

      {/* Message form */}
      {activeTab === "message" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          style={{ marginTop: 28 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="msg-name">
                Name
              </label>
              <input
                id="msg-name"
                name="name"
                required
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="msg-email">
                Email
              </label>
              <input
                id="msg-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle} htmlFor="msg-message">
              Message
            </label>
            <textarea
              id="msg-message"
              name="message"
              required
              rows={5}
              placeholder="Tell us more..."
              style={{
                ...inputStyle,
                height: "auto",
                padding: "12px 14px",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 24,
              width: "100%",
              height: 48,
              background: "#1A1512",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Send message
          </button>
        </form>
      )}

      {/* Review form */}
      {activeTab === "review" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          style={{ marginTop: 28 }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="rev-name">
                Name
              </label>
              <input
                id="rev-name"
                name="name"
                required
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle} htmlFor="rev-email">
                Email
              </label>
              <input
                id="rev-email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Star rating */}
          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Rating</label>
            <div style={{ display: "flex", gap: 4 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    lineHeight: 1,
                  }}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  <Star
                    size={28}
                    fill={
                      star <= (hoverRating || rating) ? "#C8922E" : "none"
                    }
                    stroke={
                      star <= (hoverRating || rating) ? "#C8922E" : "#DCD3C5"
                    }
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle} htmlFor="rev-subject">
              Subject
            </label>
            <input
              id="rev-subject"
              name="subject"
              required
              placeholder="Review title"
              style={inputStyle}
            />
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle} htmlFor="rev-review">
              Your review
            </label>
            <textarea
              id="rev-review"
              name="review"
              required
              rows={5}
              placeholder="Share your experience..."
              style={{
                ...inputStyle,
                height: "auto",
                padding: "12px 14px",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 24,
              width: "100%",
              height: 48,
              background: "#1A1512",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 2,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Submit review
          </button>
        </form>
      )}
    </div>
  );
}
