// src/pages/PricingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PricingSection from "../components/landing/PricingSection";
import PassConfirmModal from "../components/premium/PassConfirmModal";
import { useAuthStore } from "../store/authStore";

export default function PricingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [confirmPass, setConfirmPass] = useState(null);

  // Where to send the user after a successful purchase. Defaults to
  // /dashboard (normal case — user browsed Pricing directly). Two ways this
  // gets overridden:
  //  1. Same-session, already-logged-in case: the caller (e.g. Builder's
  //     "buy Advanced ATS add-on" nudge) passes state: { returnTo: '/builder' }
  //     directly via navigate() — read from location.state below.
  //  2. Logged-out case: the user got bounced to /auth first. returnTo
  //     survives that whole detour as a query param (?returnTo=...) since
  //     both the email/password redirect (AuthPage) and the Google OAuth
  //     redirect (AuthCallback) land back here via a plain URL, not
  //     React Router state.
  const [returnTo, setReturnTo] = useState(
    location.state?.returnTo || searchParams.get("returnTo") || "/dashboard"
  );

  // If we landed here straight off a login redirect with ?confirm=placement
  // (or ?confirm=addon_cover_letter etc.), possibly with &returnTo=... too,
  // and the user is now actually logged in, auto-open the confirm screen
  // for that pass/addon instead of making them click it again.
  useEffect(() => {
    const pending = searchParams.get("confirm");
    const returnToParam = searchParams.get("returnTo");

    if (returnToParam) {
      setReturnTo(returnToParam);
    }

    if (pending && user) {
      setConfirmPass(pending);
      // clean the URL so a refresh doesn't re-trigger it
      searchParams.delete("confirm");
      searchParams.delete("returnTo");
      setSearchParams(searchParams, { replace: true });
    }
  }, [user, searchParams, setSearchParams]);

  const handleSelectPass = (passKey) => {
    // Passes AND add-ons both go through the same real payment flow now —
    // addons are no longer routed to /builder as a placeholder.
    if (!user) {
      // Not logged in — auth first, carry the chosen pass/addon AND where
      // to return to after purchase along, so AuthPage can route back here
      // with ?confirm=&returnTo= after login (state for email/password,
      // localStorage for Google OAuth's full-page redirect).
      navigate("/auth", { state: { pendingPass: passKey, returnTo } });
      return;
    }

    // Already logged in — show the confirm screen before charging.
    setConfirmPass(passKey);
  };

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      <div style={{ paddingTop: "76px", flex: 1 }}>
        <PricingSection onSelectPass={handleSelectPass} />
      </div>
      <Footer compact />

      {confirmPass && (
        <PassConfirmModal
          passKey={confirmPass}
          onClose={() => setConfirmPass(null)}
          onSuccess={async () => {
            // Refresh the cached profile in authStore right after a
            // successful payment — otherwise pages like CoverLetterPage
            // that read from authStore's `profile` (not a fresh Supabase
            // query) keep showing the pre-payment state until the next
            // full login/page reload.
            await useAuthStore.getState().fetchProfile();
            navigate(returnTo);
          }}
        />
      )}
    </div>
  );
}