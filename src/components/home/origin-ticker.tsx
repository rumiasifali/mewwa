"use client";

const origins = [
  "Hunza Valley",
  "Kandahar",
  "Rafsanjan, Iran",
  "Gilgit-Baltistan",
  "Chilas",
  "Herat",
  "Quetta",
  "Skardu",
];

export function OriginTicker() {
  return (
    <div
      className="overflow-hidden whitespace-nowrap"
      style={{
        background: "#1A1512",
        borderTop: "1px solid rgba(255,255,255,.08)",
        padding: "15px 0",
      }}
    >
      <div
        className="inline-flex"
        style={{
          animation: "qaaq-marquee 34s linear infinite",
          willChange: "transform",
        }}
      >
        {/* Duplicate the list for seamless loop */}
        {[0, 1].map((run) => (
          <div key={run} className="inline-flex items-center">
            {origins.map((origin) => (
              <span
                key={`${run}-${origin}`}
                className="inline-flex items-center gap-[22px] px-[22px]"
              >
                <span
                  style={{
                    fontSize: "12.5px",
                    letterSpacing: ".22em",
                    textTransform: "uppercase",
                    color: "rgba(237,231,220,.72)",
                    fontWeight: 500,
                  }}
                >
                  {origin}
                </span>
                <span
                  className="shrink-0"
                  style={{
                    width: "3px",
                    height: "3px",
                    borderRadius: "50%",
                    background: "#C8922E",
                  }}
                />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
