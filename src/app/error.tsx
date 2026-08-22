"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      style={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        padding: 24,
        fontFamily: "var(--font-sans)",
        textAlign: "center",
      }}
    >
      <h1 style={{ margin: 0, fontSize: 24, fontWeight: 700, letterSpacing: "-.03em", color: "#1A1512" }}>
        Something went wrong
      </h1>
      <p style={{ margin: 0, fontSize: 14, color: "#7C7268", maxWidth: 420 }}>
        We couldn&apos;t load this page. It&apos;s usually temporary — please try again.
      </p>
      <button
        onClick={reset}
        style={{
          marginTop: 8,
          height: 42,
          padding: "0 22px",
          background: "#1A1512",
          color: "#fff",
          fontSize: 13,
          fontWeight: 600,
          border: "none",
          borderRadius: 2,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
