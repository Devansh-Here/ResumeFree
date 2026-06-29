// src/store/authStore.js
import { create } from "zustand";
import { supabase } from "../utils/supabaseClient";

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,
  initialized: false,

  // Call once on app load — checks for an existing session
  // (e.g. user clicked a magic link earlier) and listens for changes.
  init: async () => {
    if (get().initialized) return;
    set({ initialized: true });

    const {
      data: { session },
    } = await supabase.auth.getSession();
    set({ user: session?.user ?? null });
    if (session?.user) {
      await get().fetchProfile();
    }
    set({ loading: false });

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ user: session?.user ?? null });
      if (session?.user) {
        await get().fetchProfile();
      } else {
        set({ profile: null });
      }
    });
  },

  fetchProfile: async () => {
    const { user } = get();
    if (!user) return;
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    if (!error) set({ profile: data });
  },

  isPremium: () => {
    const { profile } = get();
    if (!profile?.is_premium) return false;
    if (!profile.premium_expires_at) return false;
    return new Date(profile.premium_expires_at) > new Date();
  },

  signOut: async () => {
    await supabase.auth.signOut();a
    set({ user: null, profile: null });
  },
}));