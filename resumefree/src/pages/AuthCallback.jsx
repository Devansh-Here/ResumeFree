// src/pages/AuthCallback.jsx
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { supabase } from "../utils/supabaseClient";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | done | error
  // React StrictMode (dev only) double-invokes effects. This effect reads
  // and DELETES localStorage keys, then schedules a navigate() — running it
  // twice causes the second run to see the keys already gone (removed by the
  // first run) and navigate to /dashboard, immediately overriding the first
  // run's correct navigate to /pricing. Guard against the double-invoke.
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (hasRunRef.current) return;
    hasRunRef.current = true;

    const run = async () => {
      // Supabase JS parses the magic-link/OAuth token from the URL hash
      // automatically. We just wait for the session to land, then
      // (re)sync our auth store and move the user along.
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        useAuthStore.setState({ initialized: true, user: session.user, loading: false });
        await useAuthStore.getState().fetchProfile();
        setStatus("done");

        // If the user clicked a pass/addon before logging in (Google OAuth
        // does a full-page redirect, so AuthPage stashed it in localStorage
        // instead of React Router state — see AuthPage.jsx's
        // handleGoogleSignIn), send them back to Pricing to finish the
        // purchase instead of dropping them on the builder. `returnTo`
        // (where PricingPage should send them AFTER the purchase completes,
        // e.g. '/builder') rides along the same way, only meaningful when
        // pendingPass is also present.
        const pendingPass = localStorage.getItem("resumefree_pending_pass");
        const pendingReturnTo = localStorage.getItem("resumefree_pending_return_to");
        localStorage.removeItem("resumefree_pending_pass");
        localStorage.removeItem("resumefree_pending_return_to");

        setTimeout(() => {
          if (pendingPass) {
            const returnToParam = pendingReturnTo
              ? `&returnTo=${encodeURIComponent(pendingReturnTo)}`
              : "";
            navigate(`/pricing?confirm=${pendingPass}${returnToParam}`);
          } else {
            navigate("/dashboard");
          }
        }, 1200);
      } else {
        setStatus("error");
      }
    };
    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] px-4">
      <div className="text-center">
        <div className="text-3xl mb-3">
          {status === "loading" && "⏳"}
          {status === "done" && "✅"}
          {status === "error" && "⚠️"}
        </div>
        <p className="text-[#1e3a5f]" style={{ fontFamily: "'Inter', sans-serif" }}>
          {status === "loading" && "Logging you in..."}
          {status === "done" && "You're in! Redirecting..."}
          {status === "error" && "That link has expired or already been used. Try upgrading again."}
        </p>
      </div>
    </div>
  );
}