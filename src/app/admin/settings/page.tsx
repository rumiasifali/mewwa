"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Settings {
  id: string;
  site_name: string;
  tagline: string;
  whatsapp_number: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  flat_rate?: string | number | null;
  free_shipping_threshold?: string | number | null;
  announcement_text?: string | null;
  social_links: {
    instagram?: string;
    facebook?: string;
  };
}

/* ── design tokens ────────────────────────────────── */
const INK = "#1A1512";
const GOLD = "#C8922E";
const LINE = "#E7E1D7";
const MUTED = "#7C7268";
const MUTED2 = "#9A9086";
const BODY = "#4A4139";
const FAINT = "#B0A69A";
const INPUT_BORDER = "#DCD3C5";
const HINT_COLOR = "#B0A69A";

/* ── shared inline-style objects ──────────────────── */
const eyebrowStyle: React.CSSProperties = {
  fontSize: "10.5px",
  letterSpacing: ".18em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: INK,
  margin: 0,
};

const cardNoteStyle: React.CSSProperties = {
  fontSize: "12.5px",
  color: MUTED2,
  marginTop: 8,
  marginBottom: 0,
  lineHeight: 1.5,
};

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  letterSpacing: ".14em",
  textTransform: "uppercase",
  fontWeight: 700,
  color: BODY,
  display: "block",
};

const inputStyle: React.CSSProperties = {
  height: 38,
  border: `1px solid ${INPUT_BORDER}`,
  borderRadius: 2,
  fontSize: "13.5px",
  color: INK,
  padding: "0 12px",
  width: "100%",
  outline: "none",
  background: "#fff",
  boxSizing: "border-box",
  marginTop: 7,
  fontFamily: "Geist, sans-serif",
};

const hintStyle: React.CSSProperties = {
  fontSize: "11px",
  color: HINT_COLOR,
  marginTop: 5,
  marginBottom: 0,
};

const cardStyle: React.CSSProperties = {
  border: `1px solid ${LINE}`,
  background: "#fff",
  padding: 22,
};

const fieldGap = 14;

/* ── helpers ──────────────────────────────────────── */

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={inputStyle}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = INK;
          e.currentTarget.style.boxShadow = `0 0 0 3px rgba(200,146,46,.2)`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = INPUT_BORDER;
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {hint && <div style={hintStyle}>{hint}</div>}
    </div>
  );
}

/* ── page ─────────────────────────────────────────── */
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const supabase = createClient();

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*").single();
    if (data) setSettings(data);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await fetchSettings();
    };
    void load();
  }, [fetchSettings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    const { id, ...data } = settings;
    const payload = {
      ...data,
      flat_rate:
        data.flat_rate === "" || data.flat_rate == null
          ? null
          : Number(data.flat_rate),
      free_shipping_threshold:
        data.free_shipping_threshold === "" ||
        data.free_shipping_threshold == null
          ? null
          : Number(data.free_shipping_threshold),
    };
    const { error } = await supabase
      .from("site_settings")
      .update(payload)
      .eq("id", id);

    setSaving(false);
    if (error) {
      toast.error(`Could not save settings: ${error.message}`);
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function update(field: string, value: string) {
    setSettings((s) => (s ? { ...s, [field]: value } : s));
  }

  function updateSocial(field: string, value: string) {
    setSettings((s) =>
      s ? { ...s, social_links: { ...s.social_links, [field]: value } } : s
    );
  }

  /* loading state */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          paddingTop: 80,
          paddingBottom: 80,
        }}
      >
        <Loader2
          size={22}
          style={{ animation: "spin 1s linear infinite", color: MUTED }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  /* empty state */
  if (!settings) {
    return (
      <div style={{ textAlign: "center", paddingTop: 80, paddingBottom: 80 }}>
        <p style={{ color: MUTED, fontSize: 14 }}>
          No settings found. Run the database schema first.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSave}>
      {/* ── page header ────────────────────────────── */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 0,
          gap: 20,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 27,
              fontWeight: 750,
              letterSpacing: "-.035em",
              color: INK,
              margin: 0,
            }}
          >
            Settings
          </h1>
          <p style={{ fontSize: 13.5, color: MUTED, marginTop: 6, marginBottom: 0 }}>
            One row in{" "}
            <span
              style={{
                fontFamily: "ui-monospace, monospace",
                fontSize: 12.5,
                background: "#F0EBE3",
                padding: "1px 5px",
                borderRadius: 2,
              }}
            >
              site_settings
            </span>
            . Everything here is read by the storefront at build.
          </p>
        </div>

        {/* save button */}
        <button
          type="submit"
          disabled={saving}
          style={{
            height: 38,
            padding: "0 18px",
            background: saving ? MUTED : INK,
            color: "#fff",
            border: "none",
            borderRadius: 2,
            fontSize: "13px",
            fontWeight: 600,
            cursor: saving ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            transition: "background .15s",
            whiteSpace: "nowrap",
          }}
          onMouseEnter={(e) => {
            if (!saving) e.currentTarget.style.background = GOLD;
          }}
          onMouseLeave={(e) => {
            if (!saving) e.currentTarget.style.background = INK;
          }}
        >
          {saving ? (
            <>
              <Loader2
                size={14}
                style={{ animation: "spin 1s linear infinite" }}
              />
              Saving...
            </>
          ) : saved ? (
            "Saved"
          ) : (
            "Save changes"
          )}
        </button>
      </div>

      {/* ── 2x2 grid ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          marginTop: 22,
          alignItems: "start",
        }}
      >
        {/* ── 1. STORE ──────────────────────────────── */}
        <div style={cardStyle}>
          <p style={eyebrowStyle}>STORE</p>
          <p style={cardNoteStyle}>
            Name and tagline used in metadata and the footer.
          </p>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: fieldGap }}>
            <Field
              label="SITE_NAME"
              value={settings.site_name}
              onChange={(v) => update("site_name", v)}
              hint="site_settings.site_name"
            />
            <Field
              label="TAGLINE"
              value={settings.tagline}
              onChange={(v) => update("tagline", v)}
              hint="site_settings.tagline"
            />
            <Field
              label="CURRENCY"
              value={settings.currency}
              onChange={(v) => update("currency", v)}
              hint="Affects every price on the storefront"
            />
          </div>
        </div>

        {/* ── 2. CONTACT ────────────────────────────── */}
        <div style={cardStyle}>
          <p style={eyebrowStyle}>CONTACT</p>
          <p style={cardNoteStyle}>
            The WhatsApp number powers every order button.
          </p>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: fieldGap }}>
            <Field
              label="WHATSAPP_NUMBER"
              value={settings.whatsapp_number}
              onChange={(v) => update("whatsapp_number", v)}
              hint="No plus, no spaces — used to build wa.me links"
            />
            <Field
              label="EMAIL"
              value={settings.email}
              onChange={(v) => update("email", v)}
              type="email"
              hint="site_settings.email"
            />
            <Field
              label="PHONE"
              value={settings.phone}
              onChange={(v) => update("phone", v)}
              hint="site_settings.phone"
            />
            <Field
              label="ADDRESS"
              value={settings.address}
              onChange={(v) => update("address", v)}
              hint="Shown in the footer"
            />
          </div>
        </div>

        {/* ── 3. SHIPPING ───────────────────────────── */}
        <div style={cardStyle}>
          <p style={eyebrowStyle}>SHIPPING</p>
          <p style={cardNoteStyle}>
            New fields — the top bar and shipping tab read these.
          </p>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: fieldGap }}>
            <Field
              label="FLAT_RATE (PKR)"
              value={String(settings.flat_rate ?? "")}
              onChange={(v) => update("flat_rate", v)}
              hint="Domestic courier"
            />
            <Field
              label="FREE_SHIPPING_OVER (PKR)"
              value={String(settings.free_shipping_threshold ?? "")}
              onChange={(v) => update("free_shipping_threshold", v)}
              hint="Drives the announcement bar copy"
            />
            <Field
              label="ANNOUNCEMENT_BAR"
              value={settings.announcement_text || ""}
              onChange={(v) => update("announcement_text", v)}
              hint="Leave empty to hide the bar"
            />
          </div>
        </div>

        {/* ── 4. SOCIAL ─────────────────────────────── */}
        <div style={cardStyle}>
          <p style={eyebrowStyle}>SOCIAL</p>
          <p style={cardNoteStyle}>
            Rendered as the footer icon row.
          </p>

          <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: fieldGap }}>
            <Field
              label="INSTAGRAM"
              value={settings.social_links?.instagram || ""}
              onChange={(v) => updateSocial("instagram", v)}
              hint="social_links.instagram"
            />
            <Field
              label="FACEBOOK"
              value={settings.social_links?.facebook || ""}
              onChange={(v) => updateSocial("facebook", v)}
              hint="social_links.facebook"
            />
          </div>
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </form>
  );
}
