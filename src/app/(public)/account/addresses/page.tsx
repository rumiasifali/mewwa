"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Check } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";

const C = {
  ink: "#1A1512",
  ink2: "#2A211A",
  gold: "#C8922E",
  paper: "#FBF9F5",
  line: "#E7E1D7",
  line2: "#F0EBE3",
  line3: "#DCD3C5",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
  okBg: "#E6EFE0",
  okColor: "#2E5A22",
  warn: "#B4551F",
} as const;

interface Address {
  id: string;
  label: string;
  recipient: string;
  line1: string;
  line2: string | null;
  city: string;
  postal_code: string;
  phone: string;
  is_default: boolean;
}

const EMPTY: Omit<Address, "id" | "is_default"> = {
  label: "Home",
  recipient: "",
  line1: "",
  line2: null,
  city: "",
  postal_code: "",
  phone: "",
};

export default function AddressesPage() {
  const { user } = useAuth();
  const supabase = createClient();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetchAddresses = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("addresses")
      .select("*")
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setAddresses(data || []);
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const handleSave = async () => {
    if (!user || !form.recipient || !form.line1 || !form.city) return;
    setSaving(true);

    if (editingId) {
      await supabase
        .from("addresses")
        .update({
          label: form.label,
          recipient: form.recipient,
          line1: form.line1,
          line2: form.line2 || null,
          city: form.city,
          postal_code: form.postal_code,
          phone: form.phone,
        })
        .eq("id", editingId);
    } else {
      const isFirst = addresses.length === 0;
      await supabase.from("addresses").insert({
        user_id: user.id,
        label: form.label,
        recipient: form.recipient,
        line1: form.line1,
        line2: form.line2 || null,
        city: form.city,
        postal_code: form.postal_code,
        phone: form.phone,
        is_default: isFirst,
      });
    }

    setForm(EMPTY);
    setShowForm(false);
    setEditingId(null);
    setSaving(false);
    fetchAddresses();
  };

  const handleSetDefault = async (id: string) => {
    // Unset all defaults first
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user!.id);
    // Set this one
    await supabase
      .from("addresses")
      .update({ is_default: true })
      .eq("id", id);
    fetchAddresses();
  };

  const handleDelete = async (id: string) => {
    await supabase.from("addresses").delete().eq("id", id);
    fetchAddresses();
  };

  const startEdit = (addr: Address) => {
    setForm({
      label: addr.label,
      recipient: addr.recipient,
      line1: addr.line1,
      line2: addr.line2,
      city: addr.city,
      postal_code: addr.postal_code,
      phone: addr.phone,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  return (
    <div>
      <div
        style={{
          fontSize: 10.5,
          letterSpacing: ".32em",
          textTransform: "uppercase",
          color: C.gold,
          fontWeight: 700,
        }}
      >
        Your account
      </div>
      <div
        style={{
          marginTop: 13,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 20,
        }}
      >
        <h1
          style={{
            margin: 0,
            fontSize: "clamp(28px, 3vw, 38px)",
            lineHeight: 1,
            letterSpacing: "-.04em",
            fontWeight: 800,
          }}
        >
          Addresses
        </h1>
        {!showForm && (
          <button
            onClick={() => {
              setForm(EMPTY);
              setEditingId(null);
              setShowForm(true);
            }}
            className="qaaq-press"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 38,
              padding: "0 16px",
              background: C.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              border: "none",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <Plus style={{ width: 13, height: 13 }} />
            Add new address
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div
          style={{
            marginTop: 22,
            border: `1px solid ${C.line}`,
            background: "#fff",
            padding: 22,
          }}
        >
          <div
            style={{
              fontSize: 10.5,
              letterSpacing: ".18em",
              textTransform: "uppercase",
              fontWeight: 700,
              color: C.ink,
            }}
          >
            {editingId ? "Edit address" : "Add a new address"}
          </div>
          <div
            style={{
              marginTop: 18,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle}>Label</label>
                <input
                  type="text"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="Home"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Recipient name</label>
                <input
                  type="text"
                  value={form.recipient}
                  onChange={(e) =>
                    setForm({ ...form, recipient: e.target.value })
                  }
                  placeholder="Full name"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Address line 1</label>
              <input
                type="text"
                value={form.line1}
                onChange={(e) => setForm({ ...form, line1: e.target.value })}
                placeholder="House, street, area"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Address line 2</label>
              <input
                type="text"
                value={form.line2 || ""}
                onChange={(e) =>
                  setForm({ ...form, line2: e.target.value || null })
                }
                placeholder="Apartment, floor (optional)"
                style={inputStyle}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 14,
              }}
            >
              <div>
                <label style={labelStyle}>City</label>
                <input
                  type="text"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="Lahore"
                  required
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Postal code</label>
                <input
                  type="text"
                  value={form.postal_code}
                  onChange={(e) =>
                    setForm({ ...form, postal_code: e.target.value })
                  }
                  placeholder="54000"
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+92 3XX XXXXXXX"
                  style={inputStyle}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                onClick={handleSave}
                disabled={saving}
                className="qaaq-press"
                style={{
                  height: 42,
                  padding: "0 22px",
                  background: saving ? C.muted2 : C.ink,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 2,
                  border: "none",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontFamily: "inherit",
                }}
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update address"
                    : "Save address"}
              </button>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setForm(EMPTY);
                }}
                style={{
                  height: 42,
                  padding: "0 22px",
                  border: `1px solid ${C.line3}`,
                  background: "#fff",
                  fontSize: 13,
                  fontWeight: 500,
                  borderRadius: 2,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  color: C.body,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Address cards */}
      {loading ? (
        <div style={{ marginTop: 22, color: C.muted, fontSize: 13 }}>
          Loading addresses...
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <div
          style={{
            marginTop: 22,
            padding: "48px 24px",
            background: "#fff",
            border: `1px solid ${C.line}`,
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: 15, fontWeight: 600, color: C.ink, margin: 0 }}>
            No saved addresses
          </p>
          <p
            style={{
              margin: "6px 0 0",
              fontSize: 13.5,
              color: C.muted,
              lineHeight: 1.6,
            }}
          >
            Add a delivery address to speed up your next order.
          </p>
        </div>
      ) : (
        <div
          style={{
            marginTop: 22,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 1,
            background: C.line,
            border: `1px solid ${C.line}`,
          }}
        >
          {addresses.map((addr) => (
            <div
              key={addr.id}
              style={{ background: "#fff", padding: "18px 20px 20px" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    letterSpacing: ".14em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                    color: C.body,
                    border: `1px solid ${C.line3}`,
                    padding: "2px 7px",
                  }}
                >
                  {addr.label}
                </span>
                {addr.is_default && (
                  <span
                    style={{
                      fontSize: 10,
                      letterSpacing: ".12em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: C.okColor,
                      background: C.okBg,
                      padding: "3px 7px",
                    }}
                  >
                    Default
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: C.ink }}>
                {addr.recipient}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: C.body,
                  lineHeight: 1.6,
                  marginTop: 4,
                }}
              >
                {addr.line1}
                {addr.line2 && <>, {addr.line2}</>}
                <br />
                {addr.city}
                {addr.postal_code && `, ${addr.postal_code}`}
              </div>
              {addr.phone && (
                <div
                  style={{ fontSize: 13, color: C.muted, marginTop: 4 }}
                >
                  {addr.phone}
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: `1px solid ${C.line2}`,
                  display: "flex",
                  gap: 12,
                  alignItems: "center",
                }}
              >
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: C.ink,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      padding: 0,
                    }}
                  >
                    <Check style={{ width: 12, height: 12 }} />
                    Set as default
                  </button>
                )}
                <button
                  onClick={() => startEdit(addr)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 500,
                    color: C.muted,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  <Pencil style={{ width: 12, height: 12 }} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(addr.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 5,
                    fontSize: 12,
                    fontWeight: 500,
                    color: C.warn,
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    padding: 0,
                  }}
                >
                  <Trash2 style={{ width: 12, height: 12 }} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: "#4A4139",
};

const inputStyle: React.CSSProperties = {
  marginTop: 7,
  width: "100%",
  height: 40,
  padding: "0 12px",
  border: "1px solid #DCD3C5",
  borderRadius: 2,
  fontSize: 13.5,
  fontFamily: "Geist, sans-serif",
  outline: "none",
  color: "#1A1512",
  boxSizing: "border-box",
};
