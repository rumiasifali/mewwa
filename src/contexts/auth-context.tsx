"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type AuthView = "login" | "signup" | "forgot" | "sent";

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  wa_updates: boolean;
  avatar_url: string | null;
  role: string;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authOpen: boolean;
  authView: AuthView;
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
  setAuthView: (view: AuthView) => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authOpen, setAuthOpen] = useState(false);
  const [authView, setAuthView] = useState<AuthView>("login");

  const supabase = createClient();

  const fetchProfile = useCallback(
    async (userId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
        return;
      }

      // Right after signup the DB trigger may not have created the
      // profile row yet — retry once after a short delay.
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const { data: retryData, error: retryError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (retryError) {
        console.error("Failed to fetch profile (retry):", retryError);
        return;
      }
      setProfile(retryData);
    },
    [supabase]
  );

  const refreshProfile = useCallback(async () => {
    if (user) await fetchProfile(user.id);
  }, [user, fetchProfile]);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);
      if (currentUser) await fetchProfile(currentUser.id);
      setLoading(false);
    };
    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        await fetchProfile(newUser.id);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openAuthModal = useCallback((view: AuthView = "login") => {
    setAuthView(view);
    setAuthOpen(true);
  }, []);

  // Check URL for ?auth=login param (from middleware redirect)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const authParam = params.get("auth");
    if (authParam === "login" && !user && !loading) {
      // Syncing FROM an external system (the URL set by the middleware
      // redirect) into React state — a one-shot open, not a cascade.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      openAuthModal("login");
      // Clean up URL
      params.delete("auth");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");
      window.history.replaceState({}, "", newUrl);
    }
  }, [user, loading, openAuthModal]);

  const closeAuthModal = useCallback(() => {
    setAuthOpen(false);
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    // Don't leave the user stranded on a protected page.
    if (
      typeof window !== "undefined" &&
      (window.location.pathname.startsWith("/account") ||
        window.location.pathname.startsWith("/admin"))
    ) {
      window.location.href = "/";
    }
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        authOpen,
        authView,
        openAuthModal,
        closeAuthModal,
        setAuthView,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
