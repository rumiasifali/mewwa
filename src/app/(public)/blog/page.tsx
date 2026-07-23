import Link from "next/link";
import Image from "next/image";
import { getPosts } from "@/lib/data";
import { ArrowRight } from "lucide-react";

export const revalidate = 60;

export const metadata = {
  title: "Blog",
  description:
    "Tips, recipes, and insights about premium dry fruits and healthy living.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="pt-24 sm:pt-28 pb-24">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <p className="text-sm font-medium text-primary uppercase tracking-wider">
            Blog
          </p>
          <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight">
            Stories & Insights
          </h1>
          <p className="mt-3 text-muted-foreground text-lg max-w-xl">
            Tips, recipes, health benefits, and the story behind our products.
          </p>
        </div>

        {/* Posts */}
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No posts published yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {posts.map((post, i) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <article className="overflow-hidden rounded-2xl bg-card border border-border/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                  {/* Cover image */}
                  {post.cover_image && (
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image
                        src={post.cover_image}
                        alt={post.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 720px"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  <div className="p-6 sm:p-8">
                    {/* Date */}
                    <time className="text-xs text-muted-foreground uppercase tracking-wider">
                      {new Date(
                        post.published_at || post.created_at
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>

                    {/* Title */}
                    <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>

                    {/* Excerpt */}
                    {post.excerpt && (
                      <p className="mt-3 text-muted-foreground leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>
                    )}

                    {/* Read more */}
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-primary">
                      Read more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
