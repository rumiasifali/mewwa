import Link from "next/link";
import Image from "next/image";
import type { BlogPost } from "@/types";

type Post = BlogPost & { published_at?: string; category?: string };

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function JournalSection({ posts }: { posts: Post[] }) {
  if (!posts.length) return null;

  return (
    <section
      style={{
        maxWidth: 1400,
        margin: "0 auto",
        padding: "96px 28px 0",
      }}
    >
      {/* ── Header row ── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 24,
          paddingBottom: 20,
          borderBottom: "1px solid #1A1512",
        }}
      >
        <div>
          <div className="qaaq-eyebrow">06 — Journal</div>
          <h2
            style={{
              margin: "14px 0 0",
              fontSize: "clamp(34px, 4vw, 54px)",
              lineHeight: 1,
              letterSpacing: "-.04em",
              fontWeight: 800,
            }}
          >
            Notes from the valleys
          </h2>
        </div>

        <Link
          href="/blog"
          style={{
            flexShrink: 0,
            fontSize: 13,
            fontWeight: 600,
            borderBottom: "1px solid #C8922E",
            paddingBottom: 2,
            marginBottom: 6,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          All entries
        </Link>
      </div>

      {/* ── Card grid ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: "#E7E1D7",
          borderTop: "1px solid #E7E1D7",
        }}
      >
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="qaaq-zoom"
            style={{
              background: "#FBF9F5",
              padding: "20px 20px 26px",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            {/* Image */}
            <div
              style={{
                aspectRatio: "16 / 10",
                overflow: "hidden",
                background: "#F0EBE3",
                position: "relative",
              }}
            >
              {post.cover_image && (
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>

            {/* Meta row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginTop: 16,
              }}
            >
              {post.category && (
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    color: "#C8922E",
                    fontWeight: 700,
                  }}
                >
                  {post.category}
                </span>
              )}
              <span style={{ fontSize: 11.5, color: "#B0A69A" }}>
                {formatDate(post.published_at || post.created_at)}
              </span>
            </div>

            {/* Title */}
            <h3
              style={{
                margin: "10px 0 0",
                fontSize: 21,
                fontWeight: 650,
                letterSpacing: "-.03em",
                lineHeight: 1.22,
              }}
            >
              {post.title}
            </h3>

            {/* Excerpt */}
            {post.excerpt && (
              <p
                style={{
                  margin: "9px 0 0",
                  fontSize: 13.5,
                  lineHeight: 1.6,
                  color: "#7C7268",
                }}
              >
                {post.excerpt}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
