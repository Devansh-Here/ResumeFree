// src/pages/PricingPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PricingSection from "../components/landing/PricingSection";
import PassConfirmModal from "../components/premium/PassConfirmModal";
import { useAuthStore } from "../store/authStore";

export default function PricingPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((s) => s.user);

  const [confirmPass, setConfirmPass] = useState(null);

  // If we landed here straight off a login redirect with ?confirm=placement,
  // and the user is now actually logged in, auto-open the confirm screen
  // for that pass instead of making them click it again.
  useEffect(() => {
    const pending = searchParams.get("confirm");
    if (pending && user) {
      setConfirmPass(pending);
      // clean the URL so a refresh doesn't re-trigger it
      searchParams.delete("confirm");
      setSearchParams(searchParams, { replace: true });
    }
  }, [user, searchParams, setSearchParams]);

  const handleSelectPass = (passKey) => {
    // Add-on chips (cover letter / JD tailoring / ATS) aren't full
    // passes yet — keep their old placeholder behavior for now.
    if (passKey.startsWith("addon_")) {
      navigate("/builder");
      return;
    }

    if (!user) {
      // Not logged in — auth first, carry the chosen pass along so
      // AuthPage can route back here with ?confirm= after login.
      navigate("/auth", { state: { pendingPass: passKey } });
      return;
    }

    // Already logged in — still show a confirm screen before charging.
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
          onSuccess={() => navigate("/dashboard")}
        />
      )}
    </div>
  );
}