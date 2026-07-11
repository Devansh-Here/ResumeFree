// src/components/premium/PhotoFeatureShowcaseModal.jsx
//
// Shown when a FREE user clicks the locked Photo/Background editor.
// Instead of dropping them straight onto /pricing, this plays a short
// looping animation demonstrating the feature (busy background → removed
// → new clean background → photo appears in the resume), then gives them
// an explicit CTA to unlock. Pure CSS/SVG illustration — no real photos
// needed, zero asset cost, same crossfade technique as AIDemoCard.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";

const STAGE_DURATION_MS = 1800;
const STAGES = ["busy", "removed", "colored", "placed"];

export default function PhotoFeatureShowcaseModal({ onClose }) {
  const navigate = useNavigate();
  const [stageIdx, setStageIdx] = useState(0);
  const stage = STAGES[stageIdx];

  useEffect(() => {
    const interval = setInterval(() => {
      setStageIdx((i) => (i + 1) % STAGES.length);
    }, STAGE_DURATION_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const handleUnlock = () => {
    onClose();
    navigate("/pricing");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0a1628]/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-[0_20px_60px_-10px_rgba(10,22,40,0.35)] w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#cbd5e1] flex items-center justify-center text-[#4a6fa5] hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628] transition-colors duration-150"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Headline */}
        <h3
          className="text-[1.375rem] font-bold text-[#0a1628] leading-tight pr-6"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          Make your photo resume-ready
        </h3>
        <p className="text-[0.8125rem] text-[#1e3a5f]/70 mt-1.5 mb-6">
          Remove any background, drop in a clean one, and it flows straight
          into your resume — automatically.
        </p>

        {/* Animation stage */}
        <div className="relative h-40 mb-6 flex items-center justify-center gap-8">
          {/* Photo circle */}
          <div
            className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white shadow-[0_4px_16px_rgba(10,22,40,0.15)] transition-transform duration-700"
            style={{
              transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)",
              transform: stage === "placed" ? "translateX(48px) scale(0.72)" : "translateX(0) scale(1)",
            }}
          >
            {/* Busy background layer */}
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: stage === "busy" ? 1 : 0,
                background:
                  "radial-gradient(circle at 30% 30%, #f59e0b 0%, transparent 45%), radial-gradient(circle at 70% 60%, #0ea5e9 0%, transparent 45%), radial-gradient(circle at 50% 90%, #ec4899 0%, transparent 50%), #e2e8f0",
              }}
            />
            {/* Transparent (removed) layer */}
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: stage === "removed" ? 1 : 0,
                backgroundImage:
                  "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                backgroundSize: "10px 10px",
                backgroundPosition: "0 0, 0 5px, 5px -5px, -5px 0px",
                backgroundColor: "#ffffff",
              }}
            />
            {/* New solid background layer */}
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                opacity: stage === "colored" || stage === "placed" ? 1 : 0,
                backgroundColor: "#059669",
              }}
            />

            {/* Silhouette (stays constant through every stage) */}
            <svg
              className="absolute inset-0 m-auto w-14 h-14 text-white/95 z-10"
              style={{ top: "6px" }}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5z" />
            </svg>
          </div>

          {/* Mini resume mockup card */}
          <div
            className="w-24 h-32 rounded-xl bg-[#f8fafc] border border-[#cbd5e1] p-2.5 flex flex-col gap-1.5 transition-opacity duration-500"
            style={{ opacity: stage === "placed" ? 1 : 0.35 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-3.5 h-3.5 rounded-full bg-[#059669] shrink-0" />
              <span className="h-1.5 flex-1 rounded-full bg-[#cbd5e1]" />
            </div>
            <span className="h-1 w-4/5 rounded-full bg-[#e2e8f0]" />
            <span className="h-1 w-3/5 rounded-full bg-[#e2e8f0]" />
            <div className="h-px bg-[#e2e8f0] my-1" />
            <span className="h-1 w-full rounded-full bg-[#e2e8f0]" />
            <span className="h-1 w-full rounded-full bg-[#e2e8f0]" />
            <span className="h-1 w-2/3 rounded-full bg-[#e2e8f0]" />
          </div>
        </div>

        {/* Feature bullets */}
        <ul className="space-y-2 mb-6">
          {[
            "Remove any photo background instantly",
            "Add a solid color or your own background",
            "Match it to your resume's accent color",
          ].map((text) => (
            <li key={text} className="flex items-start gap-2 text-[0.8125rem] text-[#1e3a5f]">
              <svg className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l3.5 3.5L16 5" />
              </svg>
              {text}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={handleUnlock}
          className="w-full text-sm font-semibold text-white bg-[#0a1628] rounded-full px-4 py-3 hover:bg-[#1e3a5f] transition-colors duration-150"
        >
          Unlock with any pass
        </button>
        <button
          onClick={onClose}
          className="w-full text-center text-xs text-[#4a6fa5] mt-3 hover:text-[#1e3a5f] transition-colors duration-150"
        >
          Maybe later
        </button>
      </div>
    </div>,
    document.body
  );
}