import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/data";

export const revalidate = 60;

export const metadata = {
  title: "Blog",
  description:
    "Tips, recipes, and insights about premium dry fruits and healthy living.",
};

function estimateReadTime(content: string | null): number {
  if (!content) return 1;
  const text = content.replace(/<[^>]*>/g, "");
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPage() {
  const posts = await getPosts();
  const featured = posts[0] ?? null;
  const gridPosts = posts.slice(1);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 28px 110px" }}>
      {/* ── Header ── */}
      <p className="qaaq-eyebrow">The journal</p>

      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 40,
          borderBottom: "1px solid #1A1512",
          paddingBottom: 22,
          marginTop: 14,
          flexWrap: "wrap",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(36px, 4.6vw, 64px)",
            lineHeight: 0.98,
            letterSpacing: "-.045em",
            fontWeight: 800,
            maxWidth: 640,
            color: "#1A1512",
            margin: 0,
          }}
        >
          Where the food comes from, written&nbsp;down.
        </h1>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.65,
            color: "#4A4139",
            maxWidth: 330,
            margin: 0,
          }}
        >
          Origin stories, recipes, and the honest details behind what goes into
          every QAAQ pack&mdash;from orchard to shelf.
        </p>
      </div>

      {/* ── Featured post ── */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          style={{ display: "block", marginTop: 40, textDecoration: "none" }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              background: "#1A1512",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            {/* Image side */}
            <div
              style={{
                position: "relative",
                minHeight: 430,
                overflow: "hidden",
                background: "#F0EBE3",
              }}
            >
              {featured.cover_image && (
                <Image
                  src={featured.cover_image}
                  alt={featured.title}
                  fill
                  sizes="(max-width: 900px) 100vw, 55vw"
                  style={{ objectFit: "cover" }}
                  priority
                />
              )}
            </div>

            {/* Content side */}
            <div
              style={{
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Featured badge */}
              <span
                style={{
                  display: "inline-block",
                  alignSelf: "flex-start",
                  background: "#C8922E",
                  color: "#1A1512",
                  fontSize: 9.5,
                  letterSpacing: ".16em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: 1,
                }}
              >
                Featured
              </span>

              {/* Category + read time */}
              <p
                style={{
                  fontSize: 11.5,
                  letterSpacing: ".14em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,.5)",
                  fontWeight: 600,
                  marginTop: 16,
                  marginBottom: 0,
                }}
              >
                {featured.category ? `${featured.category} · ` : ""}
                {estimateReadTime(featured.content)} min read
              </p>

              {/* Title */}
              <h2
                style={{
                  fontSize: 34,
                  lineHeight: 1.1,
                  letterSpacing: "-.035em",
                  fontWeight: 750,
                  color: "#fff",
                  marginTop: 22,
                  marginBottom: 0,
                }}
              >
                {featured.title}
              </h2>

              {/* Excerpt */}
              {featured.excerpt && (
                <p
                  style={{
                    fontSize: 15.5,
                    lineHeight: 1.7,
                    color: "rgba(255,255,255,.6)",
                    marginTop: 16,
                    marginBottom: 0,
                  }}
                >
                  {featured.excerpt}
                </p>
              )}

              {/* CTA */}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#E7C079",
                  marginTop: 28,
                }}
              >
                Read the story
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ── Post grid ── */}
      {gridPosts.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "#E7E1D7",
            borderTop: "1px solid #E7E1D7",
            marginTop: 56,
          }}
        >
          {gridPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="qaaq-zoom"
              style={{
                display: "block",
                background: "#FBF9F5",
                padding: 20,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {/* Thumbnail */}
              <div
                style={{
                  aspectRatio: "16 / 10",
                  overflow: "hidden",
                  background: "#F0EBE3",
                  borderRadius: 2,
                  position: "relative",
                }}
              >
                {post.cover_image && (
                  <Image
                    src={post.cover_image}
                    alt={post.title}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
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
                  fontSize: 21,
                  fontWeight: 650,
                  letterSpacing: "-.03em",
                  lineHeight: 1.22,
                  marginTop: 10,
                  marginBottom: 0,
                  color: "#1A1512",
                }}
              >
                {post.title}
              </h3>

              {/* Excerpt */}
              {post.excerpt && (
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.6,
                    color: "#7C7268",
                    marginTop: 9,
                    marginBottom: 0,
                  }}
                >
                  {post.excerpt}
                </p>
              )}
            </Link>
          ))}
        </div>
      )}

      {/* Empty state */}
      {posts.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            color: "#7C7268",
            fontSize: 15,
          }}
        >
          No posts published yet.
        </div>
      )}
    </div>
  );
}
