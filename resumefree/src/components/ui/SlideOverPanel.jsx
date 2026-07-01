import { createPortal } from "react-dom";

export default function SlideOverPanel({ open, onClose, children, sidebarWidth = 72 }) {
  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[90]"
      style={{ background: "rgba(10,22,40,0.35)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <style>{`
        @keyframes rf-slide-in {
          from { transform: translateX(-20px); opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
        }
      `}</style>
      <div
        className="absolute inset-y-3 w-full max-w-md bg-white flex flex-col overflow-hidden"
        style={{
          left: sidebarWidth + 12,
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