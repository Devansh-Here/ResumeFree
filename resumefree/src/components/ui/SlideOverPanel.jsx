import { createPortal } from "react-dom";

// `dim` (default true) controls whether the fullscreen backdrop shows the
// navy tint. Default stays true so every EXISTING usage of this component
// elsewhere in the app is unaffected. CustomizationContent.jsx passes
// `dim={false}` — that panel is a live color/font picker, so the preview
// behind it must render at true color, not tinted, or the user can't
// accurately judge what they're picking. Click-outside-to-close still
// works with dim=false; the backdrop div is just visually transparent.
//
// `widthPercent` (default null) — when unset, keeps the original
// `max-w-md` fixed-width behavior (every existing usage of this component
// is unaffected). CustomizationContent.jsx passes `widthPercent={50}` so
// the panel fully covers the LEFT form column instead of stopping partway
// across it — a fixed max-w-md left a visible sliver of the underlying
// form (broken/cut-off borders, half-visible tabs) peeking out between
// the panel's right edge and the Live Preview panel.
export default function SlideOverPanel({ open, onClose, children, sidebarWidth = 72, dim = true, widthPercent = null }) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90]"
      style={{ background: dim ? "rgba(10,22,40,0.35)" : "transparent" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes rf-slide-in {
          from { transform: translateX(-20px); opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
        }
      `}</style>
      <div
        className={`absolute inset-y-3 bg-white flex flex-col overflow-hidden ${
          widthPercent ? "" : "w-full max-w-md"
        }`}
        style={{
          left: sidebarWidth + 12,
          ...(widthPercent ? { width: `calc(${widthPercent}vw - ${sidebarWidth + 24}px)` } : {}),
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.16) 0px 24px 48px -12px",
          animation: "rf-slide-in 0.25s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}