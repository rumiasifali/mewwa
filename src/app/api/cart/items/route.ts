import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/cart/items — add item to cart (or increment quantity)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { productId, weightGrams, weightLabel, price, currency = "PKR", quantity = 1 } = body;

  if (!productId || !weightGrams || !weightLabel || !price) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Get or create cart
  const { data: cartId } = await supabase.rpc("get_or_create_cart");

  // Check if item already exists
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("weight_grams", weightGrams)
    .single();

  if (existing) {
    // Increment quantity (capped at 10)
    const newQty = Math.min(existing.quantity + quantity, 10);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true, action: "incremented", quantity: newQty });
  }

  // Insert new item
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: productId,
    weight_grams: weightGrams,
    weight_label: weightLabel,
    price,
    currency,
    quantity: Math.min(quantity, 10),
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: "added" });
}
