import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#FBF9F5",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        fontFamily: "var(--font-sans)",
      }}
    >
      {/* 404 numeral */}
      <div
        style={{
          fontFamily: "var(--font-accent)",
          fontSize: "clamp(100px, 20vw, 180px)",
          fontWeight: 400,
          fontStyle: "italic",
          color: "#E7E1D7",
          lineHeight: 1,
          userSelect: "none",
        }}
      >
        404
      </div>

      {/* Heading */}
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          letterSpacing: "-.03em",
          color: "#1A1512",
          marginTop: 16,
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        This page has gone off the shelf.
      </h1>

      {/* Subtitle */}
      <p
        style={{
          fontSize: 15,
          color: "#7C7268",
          marginTop: 10,
          maxWidth: 400,
          textAlign: "center",
          lineHeight: 1.5,
        }}
      >
        The URL might have changed, or the product was delisted.
      </p>

      {/* Search input */}
      <div
        style={{
          position: "relative",
          marginTop: 32,
          width: "100%",
          maxWidth: 380,
        }}
      >
        {/* Search icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#B0A69A"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search products..."
          style={{
            display: "block",
            width: "100%",
            height: 48,
            border: "1px solid #DCD3C5",
            backgroundColor: "#fff",
            borderRadius: 2,
            fontSize: 15,
            padding: "0 16px 0 44px",
            outline: "none",
            color: "#1A1512",
          }}
        />
      </div>

      {/* Route buttons */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginTop: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            backgroundColor: "#1A1512",
            color: "#fff",
            borderRadius: 2,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: "none",
            border: "none",
          }}
        >
          Go home
        </Link>
        <Link
          href="/products"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            backgroundColor: "transparent",
            color: "#1A1512",
            borderRadius: 2,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: "none",
            border: "1px solid #1A1512",
          }}
        >
          Browse products
        </Link>
        <Link
          href="/contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            padding: "0 22px",
            backgroundColor: "transparent",
            color: "#1A1512",
            borderRadius: 2,
            fontSize: 13.5,
            fontWeight: 600,
            textDecoration: "none",
            border: "1px solid #DCD3C5",
          }}
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
