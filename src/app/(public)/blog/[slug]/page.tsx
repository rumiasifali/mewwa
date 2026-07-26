import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug } from "@/lib/data";
import { ArrowLeft, Clock } from "lucide-react";

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  const textContent = (post.content || "").replace(/<[^>]*>/g, "");
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const dateStr = new Date(
    post.published_at || post.created_at
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "44px 28px 110px" }}>
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

      <article className="mt-8" style={{ maxWidth: "760px", margin: "32px auto 0" }}>
        {/* Meta */}
        <div className="flex items-center gap-3" style={{ fontSize: "11.5px" }}>
          <span
            style={{
              fontSize: "10.5px",
              letterSpacing: ".16em",
              textTransform: "uppercase",
              color: "#C8922E",
              fontWeight: 700,
            }}
          >
            Journal
          </span>
          <span style={{ color: "#B0A69A" }}>{dateStr}</span>
          <span className="flex items-center gap-1" style={{ color: "#B0A69A" }}>
            <Clock style={{ width: "12px", height: "12px" }} />
            {readingTime} min
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "20px 0 0",
            fontSize: "clamp(30px, 4vw, 48px)",
            lineHeight: 1.08,
            letterSpacing: "-.04em",
            fontWeight: 800,
          }}
        >
          {post.title}
        </h1>

        {/* Excerpt */}
        {post.excerpt && (
          <p
            style={{
              margin: "20px 0 0",
              fontSize: "17px",
              lineHeight: 1.7,
              color: "#4A4139",
            }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Cover image */}
        {post.cover_image && (
          <div
            className="relative overflow-hidden mt-10"
            style={{ aspectRatio: "16/9", background: "#F0EBE3" }}
          >
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 760px"
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Content */}
        <div
          className="blog-content mt-12"
          dangerouslySetInnerHTML={{ __html: post.content || "" }}
        />

        {/* Divider */}
        <div style={{ margin: "56px 0 0", borderTop: "1px solid #E7E1D7" }} />

        {/* Bottom CTA */}
        <div
          className="flex items-center justify-between gap-6"
          style={{ padding: "28px 0" }}
        >
          <div>
            <p style={{ fontSize: "16px", fontWeight: 650 }}>
              Enjoyed this?
            </p>
            <p style={{ fontSize: "13.5px", color: "#7C7268", marginTop: "4px" }}>
              Browse our collection of premium dry fruits.
            </p>
          </div>
          <Link
            href="/products"
            className="qaaq-press shrink-0"
            style={{
              display: "inline-flex",
              alignItems: "center",
              height: "44px",
              padding: "0 22px",
              background: "#1A1512",
              color: "#fff",
              fontSize: "13.5px",
              fontWeight: 600,
              borderRadius: "2px",
            }}
          >
            Shop the collection
          </Link>
        </div>

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
          }}
        >
          <ArrowLeft style={{ width: "14px", height: "14px" }} />
          Back to Journal
        </Link>
      </article>
    </div>
  );
}
