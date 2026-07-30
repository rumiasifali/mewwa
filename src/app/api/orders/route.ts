import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// POST /api/orders — place order from cart
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    customerName,
    customerPhone,
    city,
    addressSnapshot,
    channel = "whatsapp",
    notes,
  } = body;

  if (!customerName) {
    return NextResponse.json({ error: "Customer name is required" }, { status: 400 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
