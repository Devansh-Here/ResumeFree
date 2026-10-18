// src/components/premium/CustomizationContent.jsx
//
// Uses SlideOverPanel (not the centered ATSContent-style modal) — this is
// a deliberate, non-default choice for THIS panel specifically: Customize
// is a "tweak and watch it change" feature. A full centered modal covers
// the live preview panel entirely, so the user can't see the effect of a
// color/font change while picking it. SlideOverPanel opens from the left
// (next to Sidebar), leaving the right-side ResumePreview panel unblurred
// and visible the whole time.
//
// ATS Check / JD Match / Templates intentionally stay as centered modals —
// those are "look at a result" panels, not "watch a live change" panels,
// so this doesn't change their pattern.

import SlideOverPanel from "../ui/SlideOverPanel";
import CustomizationPanel from "./CustomizationPanel";

export default function CustomizationContent({ open, onClose }) {
  return (
    <SlideOverPanel open={open} onClose={onClose} sidebarWidth={72} dim={false} widthPercent={50}>
      <div
        className="flex items-start justify-between gap-4 px-6 py-5 shrink-0"
        style={{ borderBottom: "1px solid #f1f5f9" }}
      >
        <div>
          <h2 className="text-xl text-graphite-ink font-heading leading-tight">
            Customize
          </h2>
          <p className="text-[12px] text-ash font-body mt-1 leading-relaxed">
            Changes apply live — check the preview as you go.
          </p>
        </div>
        <button
          onClick={onClose}
          type="button"
          className="w-8 h-8 shrink-0 flex items-center justify-center rounded-buttons transition-colors hover:bg-soft-snow text-ash hover:text-graphite-ink text-xl leading-none"
        >
          ×
        </button>
      </div>

      <div className="overflow-y-auto flex-1 px-6 py-5">
        <CustomizationPanel />
      </div>
    </SlideOverPanel>
  );
}