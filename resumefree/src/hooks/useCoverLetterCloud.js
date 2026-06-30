import { useState, useCallback } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuthStore } from "../store/authStore";

export function useCoverLetterCloud() {
  const user = useAuthStore((s) => s.user);

  const [letters, setLetters] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState("");

  // Insert new, or update if id is passed
  const saveCoverLetter = useCallback(
    async ({ id, title, content }) => {
      if (!user) return { error: "Not logged in." };
      setSaving(true);
      setError("");
      try {
        if (id) {
          const { data, error: err } = await supabase
            .from("cover_letters")
            .update({ title, content, updated_at: new Date().toISOString() })
            .eq("id", id)
            .eq("user_id", user.id)
            .select()
            .single();
          if (err) throw err;
          setLetters((prev) => prev.map((l) => (l.id === id ? data : l)));
          return { data };
        } else {
          const { data, error: err } = await supabase
            .from("cover_letters")
            .insert({ user_id: user.id, title, content })
            .select()
            .single();
          if (err) throw err;
          setLetters((prev) => [data, ...prev]);
          return { data };
        }
      } catch (e) {
        console.error("saveCoverLetter error:", e);
        setError(e.message || "Failed to save.");
        return { error: e.message || "Failed to save." };
      } finally {
        setSaving(false);
      }
    },
    [user]
  );

  const fetchCoverLetters = useCallback(async () => {
    if (!user) return [];
    setLoadingList(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("cover_letters")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (err) throw err;
      setLetters(data || []);
      return data || [];
    } catch (e) {
      console.error("fetchCoverLetters error:", e);
      setError(e.message || "Failed to load saved letters.");
      return [];
    } finally {
      setLoadingList(false);
    }
  }, [user]);

  const deleteCoverLetter = useCallback(
    async (id) => {
      if (!user) return { error: "Not logged in." };
      try {
        const { error: err } = await supabase
          .from("cover_letters")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);
        if (err) throw err;
        setLetters((prev) => prev.filter((l) => l.id !== id));
        return { success: true };
      } catch (e) {
        console.error("deleteCoverLetter error:", e);
        setError(e.message || "Failed to delete.");
        return { error: e.message || "Failed to delete." };
      }
    },
    [user]
  );

  return {
    letters,
    saving,
    loadingList,
    error,
    saveCoverLetter,
    fetchCoverLetters,
    deleteCoverLetter,
  };
}