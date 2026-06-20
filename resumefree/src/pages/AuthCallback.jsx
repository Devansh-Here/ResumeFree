// src/pages/AuthCallback.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../utils/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | done | error

  useEffect(() => {
    const run = async () => {
      // Supabase JS parses the magic-link token from the URL hash
      // automatically. We just wait for the session to land, then
      // (re)sync our auth store and move the user along.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        useAuthStore.setState({ initialized: true, user: session.user, loading: false });
        await useAuthStore.getState().fetchProfile();
        setStatus("done");
        setTimeout(() => navigate("/builder"), 1200);
      } else {
        setStatus("error");
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F4EF] px-4">
      <div className="text-center">
        <div className="text-3xl mb-3">
          {status === "loading" && "⏳"}
          {status === "done" && "✅"}
          {status === "error" && "⚠️"}
        </div>
        <p className="text-[#161A2E]/70" style={{ fontFamily: "'Inter', sans-serif" }}>
          {status === "loading" && "Logging you in..."}
          {status === "done" && "You're in! Redirecting..."}
          {status === "error" && "That link has expired or already been used. Try upgrading again."}
        </p>
      </div>
    </div>
  );
}