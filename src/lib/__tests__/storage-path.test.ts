import { describe, it, expect } from "vitest";
import { extractFilePathFromUrl } from "@/lib/supabase/storage";

// Regression: this used to return "product-images/1234.jpg" (bucket
// prefix included), so storage.remove() silently deleted nothing and
// every replaced image was orphaned.
describe("extractFilePathFromUrl", () => {
  it("returns the path relative to the bucket, without the bucket prefix", () => {
    expect(
      extractFilePathFromUrl(
        "https://xxx.supabase.co/storage/v1/object/public/product-images/1234-abc.jpg"
      )
    ).toBe("1234-abc.jpg");
  });

  it("handles nested paths", () => {
    expect(
      extractFilePathFromUrl(
        "https://xxx.supabase.co/storage/v1/object/public/product-images/posts/cover.png",
        "product-images"
      )
    ).toBe("posts/cover.png");
  });

  it("returns null for non-storage URLs and other buckets", () => {
    expect(extractFilePathFromUrl("https://example.com/image.jpg")).toBeNull();
    expect(
      extractFilePathFromUrl(
        "https://xxx.supabase.co/storage/v1/object/public/other-bucket/file.jpg",
        "product-images"
      )
    ).toBeNull();
  });

  it("returns null for invalid input", () => {
    expect(extractFilePathFromUrl("not a url")).toBeNull();
    expect(extractFilePathFromUrl("")).toBeNull();
  });
});
