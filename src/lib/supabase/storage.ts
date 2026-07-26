import { createClient } from "@/lib/supabase/client";

/**
 * Extracts the file path from a Supabase Storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/product-images/1234-abc.jpg
 * Returns: 1234-abc.jpg
 */
export function extractFilePathFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/object/public/");
    if (pathParts.length === 2) {
      return pathParts[1];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Deletes an image from Supabase Storage by its URL
 */
export async function deleteImageFromUrl(
  imageUrl: string,
  bucket: string = "product-images"
): Promise<boolean> {
  if (!imageUrl) return false;

  const filePath = extractFilePathFromUrl(imageUrl);
  if (!filePath) return false;

  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting image:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error deleting image from storage:", err);
    return false;
  }
}

/**
 * Deletes multiple images from Supabase Storage
 */
export async function deleteImagesFromUrls(
  imageUrls: string[],
  bucket: string = "product-images"
): Promise<boolean> {
  if (imageUrls.length === 0) return true;

  const filePaths = imageUrls
    .map((url) => extractFilePathFromUrl(url))
    .filter((path): path is string => path !== null);

  if (filePaths.length === 0) return false;

  try {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove(filePaths);

    if (error) {
      console.error("Error deleting images:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Error deleting images from storage:", err);
    return false;
  }
}
