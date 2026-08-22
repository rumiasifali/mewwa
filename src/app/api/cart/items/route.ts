import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findWeightVariant, isValidQuantity } from "@/lib/cart-pricing";

// POST /api/cart/items — add item to cart (or increment quantity)
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { productId?: unknown; weightGrams?: unknown; quantity?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const productId = typeof body.productId === "string" ? body.productId : null;
  const weightGrams = Number(body.weightGrams);
  const quantity = body.quantity === undefined ? 1 : body.quantity;

  if (!productId || !Number.isInteger(weightGrams) || weightGrams <= 0) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (!isValidQuantity(quantity)) {
    return NextResponse.json({ error: "Quantity must be between 1 and 10" }, { status: 400 });
  }

  // Price, label, and currency come from the catalog — never the client.
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("id, is_available, weights")
    .eq("id", productId)
    .single();

  if (productError || !product || !product.is_available) {
    return NextResponse.json({ error: "Product not available" }, { status: 400 });
  }

  const variant = findWeightVariant(product.weights, weightGrams);
  if (!variant) {
    return NextResponse.json({ error: "Invalid weight option" }, { status: 400 });
  }

  const { data: cartId, error: cartError } = await supabase.rpc("get_or_create_cart");
  if (cartError || !cartId) {
    return NextResponse.json({ error: "Could not access cart" }, { status: 500 });
  }

  // Check if item already exists
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("weight_grams", weightGrams)
    .maybeSingle();

  if (existing) {
    // Increment quantity (capped at 10)
    const newQty = Math.min(existing.quantity + quantity, 10);
    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQty, price: variant.price })
      .eq("id", existing.id);

    if (error) {
      return NextResponse.json({ error: "Could not update cart item" }, { status: 500 });
    }
    return NextResponse.json({ success: true, action: "incremented", quantity: newQty });
  }

  // Insert new item
  const { error } = await supabase.from("cart_items").insert({
    cart_id: cartId,
    product_id: productId,
    weight_grams: weightGrams,
    weight_label: variant.label,
    price: variant.price,
    currency: variant.currency || "PKR",
    quantity,
  });

  if (error) {
    return NextResponse.json({ error: "Could not add item to cart" }, { status: 500 });
  }

  return NextResponse.json({ success: true, action: "added" });
}
