import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkApiRateLimit } from "@/lib/api-rate-limit";

// POST /api/orders — place order from cart
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Burst guard (per instance) + DB-backed cap on recent orders. Blocks
  // accidental double-submits and runaway clients burning order refs.
  if (!checkApiRateLimit(`orders:${user.id}`, 3, 60_000)) {
    return NextResponse.json(
      { error: "Too many orders — please wait a minute and try again" },
      { status: 429 }
    );
  }
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count: recentCount } = await supabase
    .from("orders")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", user.id)
    .gte("created_at", tenMinutesAgo);
  if ((recentCount || 0) >= 5) {
    return NextResponse.json(
      { error: "Too many recent orders — please contact us on WhatsApp if this is intentional" },
      { status: 429 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  const {
    customerName,
    customerPhone,
    city,
    addressSnapshot,
    channel = "whatsapp",
    notes,
  } = body;

  if (!customerName || typeof customerName !== "string" || !customerName.trim()) {
    return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
  }
  if (customerName.length > 200 || (typeof notes === "string" && notes.length > 2000)) {
    return NextResponse.json({ error: "Input too long" }, { status: 400 });
  }
  if (channel !== "whatsapp" && channel !== "gateway") {
    return NextResponse.json({ error: "Invalid channel" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("place_order_from_cart", {
    p_customer_name: customerName,
    p_customer_phone: customerPhone || null,
    p_city: city || null,
    p_address_snapshot: addressSnapshot || null,
    p_channel: channel,
    p_notes: notes || null,
  });

  if (error) {
    console.error("Place order error:", error);
    return NextResponse.json({ error: "Could not place order" }, { status: 500 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = data as any;

  if (result?.error) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    orderId: result.order_id,
    ref: result.ref,
    total: result.total,
    itemCount: result.item_count,
  });
}
