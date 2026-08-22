"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "sonner";

const C = {
  ink: "#1A1512",
  gold: "#C8922E",
  line: "#E7E1D7",
  line2: "#F0EBE3",
  line3: "#DCD3C5",
  muted: "#7C7268",
  muted2: "#9A9086",
  faint: "#B0A69A",
  body: "#4A4139",
  warnBg: "#F7EBDA",
  warnText: "#6B3A12",
  warnBorder: "#B4551F",
  warn: "#B4551F",
} as const;

export default function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const supabase = createClient();

  // Profile form
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // Delete account
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync form fields from the async-loaded profile using the
  // render-time state adjustment pattern (avoids an extra effect pass).
  const [syncedProfile, setSyncedProfile] = useState(profile);
  if (profile !== syncedProfile) {
    setSyncedProfile(profile);
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }

  const handleProfileSave = async () => {
    if (!user) return;
    setProfileSaving(true);

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);

    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated");
      await refreshProfile();
    }
    setProfileSaving(false);
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }

    setPasswordSaving(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setPasswordError(error.message);
    } else {
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  };

  const handleDeleteAccount = async () => {
    // For now, just sign out. Full account deletion would require a server-side function.
    toast("Account deletion requested. Contact us on WhatsApp to complete.");
    setShowDeleteConfirm(false);
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
      <h1
        style={{
          margin: "13px 0 0",
          fontSize: "clamp(28px, 3vw, 38px)",
          lineHeight: 1,
          letterSpacing: "-.04em",
          fontWeight: 800,
        }}
      >
        Settings
      </h1>

      {/* ── Profile Section ── */}
      <div
        style={{
          marginTop: 28,
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
          Profile
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
              <label style={labelStyle}>Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+92 3XX XXXXXXX"
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email</label>
            <div
              style={{
                marginTop: 7,
                height: 40,
                padding: "0 12px",
                border: `1px solid ${C.line}`,
                borderRadius: 2,
                fontSize: 13.5,
                color: C.muted,
                background: C.line2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{user?.email}</span>
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: ".12em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: C.faint,
                }}
              >
                Can&apos;t be changed
              </span>
            </div>
          </div>
          <button
            onClick={handleProfileSave}
            disabled={profileSaving}
            className="qaaq-press"
            style={{
              height: 42,
              padding: "0 22px",
              background: profileSaving ? C.muted2 : C.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              border: "none",
              cursor: profileSaving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              width: "fit-content",
            }}
          >
            {profileSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>

      {/* ── Password Section ── */}
      <div
        style={{
          marginTop: 20,
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
          Password
        </div>

        {passwordError && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              gap: 10,
              padding: "12px 14px",
              background: C.warnBg,
              borderLeft: `2px solid ${C.warnBorder}`,
              fontSize: 12.5,
              color: C.warnText,
              lineHeight: 1.5,
            }}
          >
            {passwordError}
          </div>
        )}

        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <div>
            <label style={labelStyle}>Current password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••"
              style={inputStyle}
            />
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 14,
            }}
          >
            <div>
              <label style={labelStyle}>New password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Confirm password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••"
                style={inputStyle}
              />
            </div>
          </div>
          <button
            onClick={handlePasswordUpdate}
            disabled={passwordSaving}
            className="qaaq-press"
            style={{
              height: 42,
              padding: "0 22px",
              background: passwordSaving ? C.muted2 : C.ink,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              border: "none",
              cursor: passwordSaving ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              width: "fit-content",
            }}
          >
            {passwordSaving ? "Updating..." : "Update password"}
          </button>
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div
        style={{
          marginTop: 20,
          padding: 22,
          background: C.warnBg,
          border: `1px solid ${C.warnBorder}`,
        }}
      >
        <div
          style={{
            fontSize: 10.5,
            letterSpacing: ".18em",
            textTransform: "uppercase",
            fontWeight: 700,
            color: C.warn,
          }}
        >
          Danger zone
        </div>
        <p
          style={{
            margin: "10px 0 0",
            fontSize: 13.5,
            color: C.warnText,
            lineHeight: 1.6,
          }}
        >
          Deleting your account removes all your data permanently. This cannot
          be undone.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            style={{
              marginTop: 14,
              height: 38,
              padding: "0 18px",
              background: "transparent",
              color: C.warn,
              fontSize: 13,
              fontWeight: 600,
              borderRadius: 2,
              border: `1px solid ${C.warn}`,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Delete account
          </button>
        ) : (
          <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
            <button
              onClick={handleDeleteAccount}
              className="qaaq-press"
              style={{
                height: 38,
                padding: "0 18px",
                background: C.warn,
                color: "#fff",
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 2,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Yes, delete my account
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              style={{
                height: 38,
                padding: "0 18px",
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
        )}
      </div>
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
