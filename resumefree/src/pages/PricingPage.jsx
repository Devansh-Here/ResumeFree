// src/pages/PricingPage.jsx
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import PricingSection from "../components/landing/PricingSection";

export default function PricingPage() {
  const navigate = useNavigate();

  const handleSelectPass = (passKey) => {
  console.log("Selected pass:", passKey); // temp, Razorpay wiring tak ke liye
  navigate("/builder");
};

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />
      {/* Navbar is `fixed`, so it's out of normal flow — this spacer pushes
          page content below it. Reduced from 88px to 76px since the
          PricingSection header above the cards was also tightened, so the
          whole page (header + 3 cards + add-ons) now fits within a single
          standard laptop viewport without scrolling. */}
      <div style={{ paddingTop: "76px", flex: 1 }}>
        <PricingSection onSelectPass={handleSelectPass} />
      </div>
      <Footer compact />
    </div>
  );
}