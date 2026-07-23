"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, Check } from "lucide-react";

interface Settings {
  id: string;
  site_name: string;
  tagline: string;
  whatsapp_number: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  social_links: {
    instagram?: string;
    facebook?: string;
  };
}

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
    fetchSettings();
  }, [fetchSettings]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);

    const { id, ...data } = settings;
    await supabase.from("site_settings").update(data).eq("id", id);

    setSaving(false);
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

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">
          No settings found. Run the database schema first.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your store details
        </p>
      </div>

      <form onSubmit={handleSave} className="max-w-2xl space-y-8">
        {/* General */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">General</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Site Name</Label>
              <Input
                value={settings.site_name}
                onChange={(e) => update("site_name", e.target.value)}
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Tagline</Label>
              <Input
                value={settings.tagline}
                onChange={(e) => update("tagline", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Currency</Label>
            <Input
              value={settings.currency}
              onChange={(e) => update("currency", e.target.value)}
              placeholder="PKR"
              className="rounded-lg w-32"
            />
          </div>
        </section>

        {/* Contact */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Contact</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>WhatsApp Number</Label>
              <Input
                value={settings.whatsapp_number}
                onChange={(e) => update("whatsapp_number", e.target.value)}
                placeholder="923001234567"
                className="rounded-lg"
              />
              <p className="text-xs text-muted-foreground">
                Country code + number, no spaces or dashes
              </p>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input
                value={settings.phone}
                onChange={(e) => update("phone", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={settings.email}
                onChange={(e) => update("email", e.target.value)}
                type="email"
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={settings.address}
                onChange={(e) => update("address", e.target.value)}
                className="rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Social */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Social Media</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Instagram URL</Label>
              <Input
                value={settings.social_links?.instagram || ""}
                onChange={(e) => updateSocial("instagram", e.target.value)}
                placeholder="https://instagram.com/..."
                className="rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label>Facebook URL</Label>
              <Input
                value={settings.social_links?.facebook || ""}
                onChange={(e) => updateSocial("facebook", e.target.value)}
                placeholder="https://facebook.com/..."
                className="rounded-lg"
              />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="pt-4 border-t">
          <Button type="submit" disabled={saving} className="rounded-xl">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : saved ? (
              <Check className="w-4 h-4 mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {saved ? "Saved!" : "Save Settings"}
          </Button>
        </div>
      </form>
    </div>
  );
}
