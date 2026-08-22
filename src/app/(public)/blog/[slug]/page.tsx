import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug, getPosts } from "@/lib/data";
import { ArrowLeft, Clock } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const allPosts = await getPosts();
  const relatedPosts = allPosts.filter((p) => p.slug !== slug).slice(0, 3);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qaaq.pk";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const shareLinks = [
    {
      label: "X",
      aria: "Share on X",
      href: `https://x.com/intent/tweet?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.title)}`,
    },
    {
      label: "FB",
      aria: "Share on Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
    },
    {
      label: "WA",
      aria: "Share on WhatsApp",
      href: `https://wa.me/?text=${encodeURIComponent(`${post.title} ${postUrl}`)}`,
    },
  ];

  const textContent = (post.content || "").replace(/<[^>]*>/g, "");
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const dateStr = new Date(
    post.published_at || post.created_at
  ).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "44px 28px 0" }}>
      {/* Breadcrumb */}
      <div
        className="flex items-center gap-2"
        style={{ fontSize: "11.5px", color: "#7C7268" }}
      >
        <Link href="/" className="hover:underline">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:underline">Journal</Link>
        <span>/</span>
        <span style={{ color: "#1A1512", fontWeight: 500 }}>{post.title}</span>
      </div>

      <article style={{ maxWidth: "1400px", margin: "20px auto 0", padding: 0 }}>
        {/* Meta + Title block constrained */}
        <div style={{ maxWidth: "760px" }}>
          {/* Meta */}
          <div className="flex items-center" style={{ gap: "12px" }}>
            <span
              style={{
                fontSize: "10.5px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#C8922E",
                fontWeight: 700,
              }}
            >
              {post.category || "Journal"}
            </span>
            <span style={{ fontSize: "12px", color: "#B0A69A" }}>
              {dateStr} &middot; {readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              margin: "18px 0 0",
              fontSize: "clamp(36px, 4.6vw, 64px)",
              lineHeight: 1,
              letterSpacing: "-.045em",
              fontWeight: 800,
              textWrap: "balance",
            }}
          >
            {post.title}
          </h1>

          {/* Excerpt */}
          {post.excerpt && (
            <p
              style={{
                margin: "22px 0 0",
                fontSize: "19px",
                lineHeight: 1.65,
                color: "#4A4139",
              }}
            >
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Cover image */}
        {post.cover_image && (
          <div
            className="relative overflow-hidden"
            style={{ marginTop: "36px", aspectRatio: "21/9", background: "#F0EBE3" }}
          >
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 1400px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content area with 3-column layout */}
        <div
          className="blog-article-grid"
          style={{
            marginTop: "56px",
            display: "grid",
            gridTemplateColumns: "200px minmax(0, 720px) 1fr",
            gap: "56px",
            alignItems: "start",
          }}
        >
          {/* TOC sidebar */}
          <aside className="blog-article-rail" style={{ position: "sticky", top: 130 }}>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: ".2em",
                textTransform: "uppercase",
                color: "#9A9086",
                fontWeight: 700,
              }}
            >
              On this page
            </div>
            <div
              style={{
                marginTop: "26px",
                paddingTop: "20px",
                borderTop: "1px solid #E7E1D7",
              }}
            >
              <div
                style={{
                  fontSize: "10px",
                  letterSpacing: ".2em",
                  textTransform: "uppercase",
                  color: "#9A9086",
                  fontWeight: 700,
                }}
              >
                Share
              </div>
              <div style={{ marginTop: "12px", display: "flex", gap: "6px" }}>
                {shareLinks.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.aria}
                    style={{
                      width: 32,
                      height: 32,
                      border: "1px solid #DCD3C5",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10.5px",
                      fontWeight: 600,
                      color: "#4A4139",
                      background: "#fff",
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>

          {/* Main content column */}
          <div>
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content || ""),
              }}
            />

            {/* Mentioned product CTA */}
            <div
              style={{
                marginTop: "52px",
                padding: "26px",
                background: "#1A1512",
                display: "flex",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: 240 }}>
                <p style={{ fontSize: "16px", fontWeight: 650, color: "#fff" }}>
                  Enjoyed this?
                </p>
                <p style={{ fontSize: "13.5px", color: "rgba(255,255,255,.55)", marginTop: "6px" }}>
                  Browse our collection of premium dry fruits.
                </p>
              </div>
              <Link
                href="/products"
                className="qaaq-press shrink-0"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  height: "48px",
                  padding: "0 22px",
                  background: "#fff",
                  color: "#1A1512",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "2px",
                }}
              >
                View products
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1A1512" strokeWidth="2">
                  <path d="M4 12h15M13 6l6 6-6 6" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Empty right column for grid balance */}
          <div className="blog-article-spacer" />
        </div>

        {/* Keep reading / related posts section */}
        {relatedPosts.length > 0 && (
          <div
            style={{
              margin: "88px 0 110px",
              paddingTop: "32px",
              borderTop: "1px solid #1A1512",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "32px",
                fontWeight: 800,
                letterSpacing: "-.04em",
              }}
            >
              Keep reading
            </h2>
            <div
              className="blog-related-grid"
              style={{
                marginTop: "32px",
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1,
                background: "#E7E1D7",
                borderTop: "1px solid #E7E1D7",
                borderBottom: "1px solid #E7E1D7",
              }}
            >
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  href={`/blog/${related.slug}`}
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
                  <span style={{ fontSize: "11.5px", color: "#B0A69A" }}>
                    {new Date(
                      related.published_at || related.created_at
                    ).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <h3
                    style={{
                      fontSize: "21px",
                      fontWeight: 650,
                      letterSpacing: "-.03em",
                      lineHeight: 1.22,
                      marginTop: "10px",
                      marginBottom: 0,
                      color: "#1A1512",
                    }}
                  >
                    {related.title}
                  </h3>
                  {related.excerpt && (
                    <p
                      style={{
                        fontSize: "13.5px",
                        lineHeight: 1.6,
                        color: "#7C7268",
                        marginTop: "9px",
                        marginBottom: 0,
                      }}
                    >
                      {related.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to journal */}
        <Link
          href="/blog"
          className="flex items-center gap-2"
          style={{
            fontSize: "13px",
            fontWeight: 600,
            color: "#7C7268",
            borderBottom: "1px solid #C8922E",
            paddingBottom: "2px",
            display: "inline-flex",
            marginBottom: "110px",
          }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Back to Journal
        </Link>
      </article>

      {/* Responsive overrides */}
      <style>{`
        @media (max-width: 1023px) {
          .blog-article-grid {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 0 !important;
            margin-top: 40px !important;
          }
          .blog-article-rail {
            display: none !important;
          }
          .blog-article-spacer {
            display: none !important;
          }
          .blog-related-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 639px) {
          .blog-related-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
