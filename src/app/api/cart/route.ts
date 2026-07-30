import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/cart — fetch current user's cart with items + product data
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ items: [] }, { status: 401 });
  }

  // Get or create cart
  const { data: cartId } = await supabase.rpc("get_or_create_cart");

  // Fetch items with product info
  const { data: items, error } = await supabase
    .from("cart_items")
    .select("*, products(id, name, slug, image_url, origin)")
    .eq("cart_id", cartId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Cart fetch error:", error);
    return NextResponse.json({ items: [] });
  }

  // Map to a clean shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapped = (items || []).map((item: any) => ({
    id: item.id,
    productId: item.product_id,
    productName: item.products?.name || "",
    productSlug: item.products?.slug || "",
    imageUrl: item.products?.image_url || "",
    origin: item.products?.origin || "",
    weightGrams: item.weight_grams,
    weightLabel: item.weight_label,
    price: Number(item.price),
    currency: item.currency,
    quantity: item.quantity,
  }));

  return NextResponse.json({ items: mapped });
}
