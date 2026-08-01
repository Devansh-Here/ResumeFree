// src/pages/Landing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Hero          from "../components/landing/Hero";
import Features      from "../components/landing/Features";
import HowItWorks    from "../components/landing/HowItWorks";
import Testimonials  from "../components/landing/Testimonials";
import PricingSection from "../components/landing/PricingSection";
import FAQ            from "../components/landing/FAQ";
import FinalCTA        from "../components/landing/FinalCTA";
import Footer           from "../components/layout/Footer";
import Navbar            from "../components/layout/Navbar";
import PassConfirmModal  from "../components/premium/PassConfirmModal";
import { useAuthStore }   from "../store/authStore";

export default function Landing() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [confirmPass, setConfirmPass] = useState(null);

  // UX AUDIT FIX: PricingSection was rendered nowhere on the landing page —
  // visitors had to navigate away to /pricing to see cost/value before
  // committing to "Start Building". This is the single biggest conversion
  // gap found in the audit (missing trust signal before the main CTA).
  // Wired here with the exact same purchase flow as PricingPage.jsx:
  // logged-out -> /auth (carrying pendingPass + returnTo), logged-in ->
  // confirm modal inline, right on this page.
  const returnTo = "/builder";

  const handleSelectPass = (passKey) => {
    if (!user) {
      navigate("/auth", { state: { pendingPass: passKey, returnTo } });
      return;
    }
    setConfirmPass(passKey);
  };

  return (
    <div className="bg-white min-h-screen">

      {/* Fixed navbar — renders on top of everything via position:fixed,
          no spacer needed here since hero is a full-bleed dark background
          and the glass navbar is meant to float over it */}
      <Navbar />

      {/* ── Dark hero card ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0a1628 0%, #0a1f14 60%, #061a10 100%)",
          borderRadius: "0px",
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 w-[600px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse 60% 50% at 85% 15%, rgba(5,150,105,0.4) 0%, transparent 65%)",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 w-[400px] h-[300px]"
          style={{
            background: "radial-gradient(ellipse 50% 40% at 15% 90%, rgba(5,150,105,0.15) 0%, transparent 60%)",
          }}
        />

        {/* Hero — dark mode */}
        <Hero dark />
      </div>
      <div
        aria-hidden="true"
        className="relative h-24 bg-white overflow-hidden"
      >
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% 100%, rgba(5,150,105,0.06) 0%, transparent 70%)"
          }}
        />
      </div>

      {/* ── White sections below ── */}
      <Features />
      <HowItWorks />
      <Testimonials />

      {/* Pricing — placed after social proof (Testimonials), before FAQ.
          Standard SaaS flow: build trust -> show price -> handle
          objections (FAQ) -> final push (FinalCTA). */}
      <PricingSection onSelectPass={handleSelectPass} />

      <FAQ />
      <FinalCTA />
      <Footer attachedTop />

      {confirmPass && (
        <PassConfirmModal
          passKey={confirmPass}
          onClose={() => setConfirmPass(null)}
          onSuccess={async () => {
            await useAuthStore.getState().fetchProfile();
            navigate(returnTo);
          }}
        />
      )}
    </div>
  );
}