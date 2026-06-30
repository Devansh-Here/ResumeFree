// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing      from "./pages/Landing";
import BuilderPage  from "./pages/BuilderPage";
import PrivacyPage  from "./pages/PrivacyPage";
import TermsPage    from "./pages/TermsPage";
import AuthCallback from "./pages/AuthCallback";
import AuthPage     from "./pages/AuthPage";
import ProfilePage  from "./pages/ProfilePage";
import PricingPage  from "./pages/PricingPage";
import { useAuthStore } from "./store/authStore";

export default function App() {
  const init = useAuthStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"              element={<Landing />} />
        <Route path="/builder"       element={<BuilderPage />} />
        <Route path="/privacy"       element={<PrivacyPage />} />
        <Route path="/terms"         element={<TermsPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/auth"          element={<AuthPage />} />
        <Route path="/dashboard"     element={<ProfilePage />} />
        <Route path="/pricing"       element={<PricingPage />} />
      </Routes>
    </BrowserRouter>
  );
}