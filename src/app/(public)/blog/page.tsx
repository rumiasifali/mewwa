import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/data";
import { NewsletterForm } from "./newsletter-form";

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
    <div style={{ maxWidth: 1400, margin: "0 auto", padding: "44px 28px 0" }}>
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
            paddingBottom: 6,
          }}
        >
          Harvest notes, sourcing economics, and the unglamorous parts of
          keeping dry fruit fresh.
        </p>
      </div>

      {/* ── Featured post ── */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}`}
          className="qaaq-zoom"
          style={{ display: "block", marginTop: 0, textDecoration: "none", cursor: "pointer" }}
        >
          <div
            className="blog-featured-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1.1fr .9fr",
              background: "#1A1512",
              overflow: "hidden",
            }}
          >
            {/* Image side */}
            <div
              className="blog-featured-media"
              style={{
                position: "relative",
                minHeight: 430,
                overflow: "hidden",
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
              className="blog-featured-body"
              style={{
                padding: "48px 44px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              {/* Featured badge + meta row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <span
                  style={{
                    background: "#C8922E",
                    color: "#1A1512",
                    fontSize: 9.5,
                    letterSpacing: ".16em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    padding: "4px 8px",
                  }}
                >
                  Featured
                </span>
                <span
                  style={{
                    fontSize: 11.5,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,.5)",
                    fontWeight: 600,
                  }}
                >
                  {featured.category ? `${featured.category} · ` : ""}
                  {estimateReadTime(featured.content)} min
                </span>
              </div>

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
                  gap: 10,
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "#E7C079",
                  marginTop: 28,
                }}
              >
                Read the story
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#E7C079"
                  strokeWidth="2"
                >
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </span>
            </div>
          </div>
        </Link>
      )}

      {/* ── Post grid ── */}
      {gridPosts.length > 0 && (
        <div
          className="blog-posts-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            background: "#E7E1D7",
            borderTop: "1px solid #E7E1D7",
            borderBottom: "1px solid #E7E1D7",
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
                padding: "20px 20px 26px",
                textDecoration: "none",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              {/* Thumbnail */}
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
                  {formatDate(post.published_at || post.created_at)} ·{" "}
                  {estimateReadTime(post.content)} min
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

      {/* ── Newsletter CTA ── */}
      <div
        className="blog-newsletter"
        style={{
          margin: "64px 0 110px",
          background: "#F5F1EA",
          border: "1px solid #E7E1D7",
          padding: "44px 44px 46px",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 48,
          alignItems: "center",
        }}
      >
        <div>
          <h3
            style={{
              margin: 0,
              fontSize: 28,
              fontWeight: 750,
              letterSpacing: "-.035em",
              lineHeight: 1.1,
            }}
          >
            One note per harvest. Nothing else.
          </h3>
          <p
            style={{
              margin: "12px 0 0",
              fontSize: 14.5,
              lineHeight: 1.65,
              color: "#4A4139",
              maxWidth: 440,
            }}
          >
            We write when a lot lands — what valley, what it tastes like, what
            it costs and why. Roughly six emails a year.
          </p>
        </div>
        <NewsletterForm />
      </div>

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

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1023px) {
          .blog-featured-grid { grid-template-columns: 1fr !important; }
          .blog-posts-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .blog-newsletter { grid-template-columns: 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 639px) {
          .blog-featured-media { min-height: 260px !important; }
          .blog-featured-body { padding: 32px 24px 36px !important; }
          .blog-posts-grid { grid-template-columns: 1fr !important; }
          .blog-newsletter { padding: 32px 24px 36px !important; }
        }
      `}</style>
    </div>
  );
}
