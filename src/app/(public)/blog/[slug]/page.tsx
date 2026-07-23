import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPostBySlug } from "@/lib/data";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { ImageLightbox } from "@/components/shared/image-lightbox";

export const revalidate = 60;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) notFound();

  // Estimate reading time (~200 words per minute)
  const textContent = (post.content || "").replace(/<[^>]*>/g, "");
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="pt-24 sm:pt-28 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Blog
        </Link>

        <article>
          <header>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(
                  post.published_at || post.created_at
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {readingTime} min read
              </span>
            </div>

            <h1 className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight">
              {post.title}
            </h1>

            {post.excerpt && (
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </header>

          {post.cover_image && (
            <ImageLightbox src={post.cover_image} alt={post.title}>
              <div className="relative aspect-[16/9] overflow-hidden rounded-2xl mt-8">
                <Image
                  src={post.cover_image}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 720px"
                  className="object-cover"
                  priority
                />
              </div>
            </ImageLightbox>
          )}

          {/* Rendered HTML content from rich editor */}
          <div
            className="blog-content mt-10"
            dangerouslySetInnerHTML={{ __html: post.content || "" }}
          />
        </article>

        {/* Bottom CTA */}
        <div className="mt-16 pt-8 border-t">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold">Enjoyed this article?</p>
              <p className="text-sm text-muted-foreground mt-1">
                Check out our premium dry fruits collection.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
