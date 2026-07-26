"use client";

export function AnnouncementBar() {
  return (
    <div
      className="fixed top-0 left-0 right-0 z-[60] hidden sm:flex items-center justify-center"
      style={{
        height: 34,
        background: "#1A1512",
        color: "#EDE7DC",
      }}
    >
      <div
        className="flex items-center"
        style={{
          gap: 28,
          fontSize: "11.5px",
          letterSpacing: ".14em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        <span>Packed to order — never off a shelf</span>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#C8922E",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span>Free delivery over PKR 5,000</span>
        <span
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#C8922E",
            flexShrink: 0,
          }}
          aria-hidden="true"
        />
        <span style={{ color: "#C8922E" }}>Lab-tested every batch</span>
      </div>
    </div>
  );
}
