// src/components/premium/PhotoEditorPanel.jsx
//
// Compact trigger + centered modal pattern (matches TemplateSwitcherContent /
// ATSContent's "centered wide modal" — overlay + rf-modal-in animation).
// The form (PersonalInfoForm.jsx) now only shows a small summary card;
// clicking it opens the full editor (upload, background removal, custom
// backgrounds) in a modal instead of taking up permanent vertical space
// in the form itself.
//
// Session-only detail worth knowing: the *transparent* (bg-removed)
// intermediate image is kept in local component state only, NOT persisted
// to localStorage (to avoid bloating it with an extra full-size image
// copy). Only the final composited `processedDataUrl` gets persisted.
// If the user reloads the page and wants to change the background again,
// we transparently re-run removal from the persisted `originalDataUrl`
// (see `handleEditBackground`) — costs another 2-5s, which is an
// acceptable tradeoff for a much smaller localStorage footprint.
//
// "Alive" micro-interactions (kept from the prior round):
//   - a slow-rotating gradient ring behind the placeholder circle (idle)
//   - person-icon → upload-icon crossfade morph on hover of the circle
//   - drag-and-drop directly onto the circle (dashed violet highlight)
//   - a shimmer sweep layered under the spinner while bg removal runs
//   - a bouncy green checkmark badge that pops in once a photo is ready
//
// NEW THIS ROUND — visual redesign pass (Devansh: "too plain/boring"):
//   - richer 2-line header with an icon badge + thin top gradient strip
//   - the empty state is now a genuine dropzone CARD (dashed rounded
//     container around the circle), not just a bare circle floating in
//     whitespace
//   - once a background can be picked, the modal widens and splits into
//     a 2-column layout: photo + actions on the left, a proper labeled
//     background GRID on the right (each swatch has a name underneath,
//     and the currently-active one gets a violet ring + check overlay
//     instead of every swatch looking identical)
//   - "Upload custom background image" is now a real dashed upload
//     button (plus icon) instead of a plain text link
// The keyframes below remain in a local <style> tag — see the note left
// in the previous round about eventually moving them into global.css
// alongside rf-modal-in.

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import {
  fileToDataUrl,
  removeImageBackground,
  applyNewBackground,
  BACKGROUND_COLOR_PRESETS,
} from "../../utils/imageProcessing";
import PhotoFeatureShowcaseModal from "./PhotoFeatureShowcaseModal";

const MAX_FILE_SIZE_MB = 8;

// ─────────────────────────────────────────────────────────────
// Local keyframes — see NOTE above about moving these to global.css
// ─────────────────────────────────────────────────────────────
function PhotoEditorKeyframes() {
  return (
    <style>{`
      @keyframes rf-pulse-ring {
        0%   { transform: scale(0.92); opacity: 0.55; }
        50%  { transform: scale(1.04); opacity: 0.9; }
        100% { transform: scale(0.92); opacity: 0.55; }
      }
      @keyframes rf-spin-slow {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes rf-shimmer {
        0%   { transform: translateX(-120%); }
        100% { transform: translateX(120%); }
      }
      @keyframes rf-pop-in {
        0%   { transform: scale(0); opacity: 0; }
        60%  { transform: scale(1.15); opacity: 1; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes rf-swatch-check-in {
        0%   { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      .rf-ring-idle {
        animation: rf-pulse-ring 2.8s ease-in-out infinite;
      }
      .rf-ring-rotate {
        animation: rf-spin-slow 6s linear infinite;
      }
      .rf-shimmer-sweep {
        animation: rf-shimmer 1.4s ease-in-out infinite;
      }
      .rf-success-badge {
        animation: rf-pop-in 0.45s cubic-bezier(.34,1.56,.64,1) forwards;
      }
      .rf-swatch-check {
        animation: rf-swatch-check-in 0.25s cubic-bezier(.34,1.56,.64,1) forwards;
      }
    `}</style>
  );
}

// ─────────────────────────────────────────────────────────────
// Default export — compact trigger card (this is what actually
// lives inline in PersonalInfoForm now)
// ─────────────────────────────────────────────────────────────
export default function PhotoEditorPanel() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const photo = useResumeStore((s) => s.resume.personal.photo);
  const [modalOpen, setModalOpen] = useState(false);

  if (!isPremium) {
    return <LockedPhotoEditor />;
  }

  const hasPhoto = !!photo?.processedDataUrl;

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="group w-full flex items-center gap-4 bg-paper-white border border-mist rounded-cards px-4 py-3 text-left
                   hover:border-iris-violet/40 hover:bg-iris-violet/[0.03] transition-colors duration-150
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-offset-2"
      >
        <div className="relative shrink-0 w-12 h-12 rounded-full overflow-hidden border border-mist bg-soft-snow flex items-center justify-center">
          {hasPhoto ? (
            <img
              src={photo.processedDataUrl}
              alt="Resume profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-5 h-5 text-mist transition-transform duration-300 group-hover:scale-110"
              style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-ash">
            Profile Photo
          </p>
          <p className="font-body text-[13px] text-slate truncate">
            {hasPhoto ? "Photo added — tap to edit" : "Add a photo & custom background"}
          </p>
        </div>

        <span className="font-body text-xs font-semibold text-iris-violet shrink-0 inline-flex items-center gap-0.5 transition-transform duration-200 group-hover:translate-x-0.5">
          Edit →
        </span>
      </button>

      {modalOpen &&
        createPortal(
          <PhotoEditorModal onClose={() => setModalOpen(false)} />,
          document.body
        )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// Modal — the actual editor (upload / remove bg / choose background).
// Width and layout adapt to stage: single narrow column while there's
// nothing to pick yet, widening into a 2-column layout once a background
// grid needs to be shown (photo + actions left, background grid right).
// ─────────────────────────────────────────────────────────────
function PhotoEditorModal({ onClose }) {
  const photo = useResumeStore((s) => s.resume.personal.photo);
  const updatePhoto = useResumeStore((s) => s.updatePhoto);
  const clearPhoto = useResumeStore((s) => s.clearPhoto);

  const [status, setStatus] = useState("idle"); // idle | removing | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [transparentDataUrl, setTransparentDataUrl] = useState(null); // session-only
  const [isDragOver, setIsDragOver] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  const photoInputRef = useRef(null);
  const bgImageInputRef = useRef(null);
  const prevStatusRef = useRef("idle");

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Fire the success badge exactly once, right when status flips from
  // "removing" to "ready" (a genuine new-photo-processed moment, not on
  // every re-render/background-swap). Auto-dismisses itself.
  useEffect(() => {
    if (prevStatusRef.current === "removing" && status === "ready") {
      setShowSuccessBadge(true);
      const t = setTimeout(() => setShowSuccessBadge(false), 1500);
      return () => clearTimeout(t);
    }
    prevStatusRef.current = status;
  }, [status]);

  const hasPhoto = !!photo?.originalDataUrl;
  const hasTransparent = !!transparentDataUrl;
  const showBackgroundGrid = hasTransparent && status === "ready";

  // ── Shared upload pipeline — used by both the file input AND drag-drop ──
  const processUploadedFile = async (file) => {
    if (!file) return;

    if (!file.type?.startsWith("image/")) {
      setStatus("error");
      setErrorMsg("Please upload an image file.");
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setStatus("error");
      setErrorMsg(`Photo is too large — please use one under ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    try {
      setStatus("removing");
      setErrorMsg("");
      setProgressPct(0);

      const originalDataUrl = await fileToDataUrl(file);
      updatePhoto({ originalDataUrl });

      await runBackgroundRemoval(originalDataUrl);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong processing that photo.");
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    await processUploadedFile(file);
  };

  // ── Drag-and-drop directly onto the dropzone ─────────────────
  const handleDragOver = (e) => {
    if (hasPhoto || status === "removing") return; // only for the empty state
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (hasPhoto || status === "removing") return;
    const file = e.dataTransfer.files?.[0];
    await processUploadedFile(file);
  };

  // ── Re-run removal on the already-uploaded photo ────────────
  const handleEditBackground = async () => {
    if (!photo?.originalDataUrl) return;
    try {
      setStatus("removing");
      setErrorMsg("");
      setProgressPct(0);
      await runBackgroundRemoval(photo.originalDataUrl);
    } catch (err) {
      setStatus("error");
      setErrorMsg(err.message || "Something went wrong processing that photo.");
    }
  };

  const runBackgroundRemoval = async (dataUrl) => {
    const transparent = await removeImageBackground(dataUrl, {
      onProgress: ({ current, total }) => {
        if (total > 0) setProgressPct(Math.round((current / total) * 100));
      },
    });
    setTransparentDataUrl(transparent);
    setStatus("ready");

    const bgType = photo?.backgroundType || "none";
    const bgValue = photo?.backgroundValue || null;
    const finalDataUrl = await applyNewBackground(transparent, bgType, bgValue);
    updatePhoto({ processedDataUrl: finalDataUrl, backgroundType: bgType, backgroundValue: bgValue });
  };

  // ── Background choice handlers ───────────────────────────────
  const applyBackground = async (bgType, bgValue) => {
    if (!transparentDataUrl) return;
    try {
      const finalDataUrl = await applyNewBackground(transparentDataUrl, bgType, bgValue);
      updatePhoto({ processedDataUrl: finalDataUrl, backgroundType: bgType, backgroundValue: bgValue });
    } catch (err) {
      setStatus("error");
      setErrorMsg("Couldn't apply that background — please try again.");
    }
  };

  const handleColorSelect = (hex) => applyBackground("color", hex);
  const handleTransparentSelect = () => applyBackground("none", null);

  const handleBgImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      const bgDataUrl = await fileToDataUrl(file);
      await applyBackground("image", bgDataUrl);
    } catch (err) {
      setStatus("error");
      setErrorMsg("Couldn't use that background image — please try another.");
    }
  };

  const handleRemovePhoto = () => {
    clearPhoto();
    setTransparentDataUrl(null);
    setStatus("idle");
    setErrorMsg("");
  };

  const isTransparentActive = (photo?.backgroundType || "none") === "none";
  const isColorActive = (hex) =>
    photo?.backgroundType === "color" && photo?.backgroundValue === hex;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(10,22,40,0.45)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <PhotoEditorKeyframes />
      <div
        className={`rf-modal-in bg-paper-white rounded-cards w-full overflow-hidden max-h-[90vh] flex flex-col transition-[max-width] duration-300 ${
          showBackgroundGrid ? "max-w-2xl" : "max-w-md"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent strip — echoes the resume templates' own accent-strip
            treatment, gives the modal a bit of brand presence up front. */}
        <div
          className="h-[3px] w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #7451f2, #a78bfa 45%, transparent)" }}
        />

        {/* Header */}
        <div className="flex items-start gap-3 px-6 pt-5 pb-4 border-b border-mist shrink-0">
          <div className="w-9 h-9 rounded-full bg-iris-violet/10 text-iris-violet flex items-center justify-center shrink-0">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-mono text-[11px] font-semibold tracking-widest uppercase text-ash">
              Profile Photo
            </h3>
            <p className="font-body text-[13px] text-slate mt-0.5">
              A clean photo makes your resume more memorable.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-7 h-7 rounded-full flex items-center justify-center text-ash hover:text-graphite-ink hover:bg-soft-snow transition-colors duration-150 shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-7 overflow-y-auto">
          {!hasPhoto && (
            <EmptyDropzone
              status={status}
              isDragOver={isDragOver}
              progressPct={progressPct}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => photoInputRef.current?.click()}
              photoInputRef={photoInputRef}
              onFileChange={handlePhotoUpload}
            />
          )}

          {hasPhoto && (
            <div className={showBackgroundGrid ? "grid grid-cols-1 sm:grid-cols-[auto,1fr] gap-8" : ""}>
              {/* ── Photo + actions column ── */}
              <div className="flex flex-col items-center text-center sm:items-center">
                <div className="relative shrink-0 w-28 h-28 mb-4">
                  <div className="relative w-28 h-28 rounded-full overflow-hidden border border-mist bg-soft-snow flex items-center justify-center">
                    {photo?.processedDataUrl && (
                      <img
                        src={photo.processedDataUrl}
                        alt="Resume profile"
                        className="w-full h-full object-cover"
                      />
                    )}

                    {status === "removing" && (
                      <div className="absolute inset-0 bg-graphite-ink/60 flex flex-col items-center justify-center gap-1 overflow-hidden">
                        <span
                          className="absolute inset-y-0 w-1/2 rf-shimmer-sweep pointer-events-none"
                          style={{
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)",
                          }}
                        />
                        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="font-body text-[10px] text-paper-white font-medium">{progressPct}%</span>
                      </div>
                    )}
                  </div>

                  {showSuccessBadge && (
                    <span className="rf-success-badge absolute bottom-0 right-0 w-8 h-8 rounded-full bg-success-text border-2 border-paper-white flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.15)]">
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l3.5 3.5L16 5" />
                      </svg>
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-2 w-full max-w-[180px]">
                  <UploadButton
                    label="Change Photo"
                    onClick={() => photoInputRef.current?.click()}
                    compact
                    fullWidth
                  />
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />

                  {!hasTransparent && status !== "removing" && (
                    <button
                      onClick={handleEditBackground}
                      className="font-body text-xs font-semibold text-iris-violet hover:underline"
                    >
                      Edit Background
                    </button>
                  )}

                  <button
                    onClick={handleRemovePhoto}
                    className="font-body text-xs font-medium text-ash hover:text-error-text transition-colors duration-150 inline-flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M14.74 9l-.346 9m-4.788 0L9.26 9M19.228 5.79c.342.052.682.107 1.022.166m-1.022-.166L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.774 5.79m14.454 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                      />
                    </svg>
                    Remove Photo
                  </button>

                  {status === "error" && (
                    <p className="font-body text-xs text-error-text mt-1">{errorMsg}</p>
                  )}
                </div>
              </div>

              {/* ── Background grid column ── */}
              {showBackgroundGrid && (
                <div className="w-full sm:pl-8 sm:border-l sm:border-mist">
                  <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-ash mb-3">
                    Background
                  </p>
                  <div className="grid grid-cols-4 gap-3">
                    <BgSwatch
                      label="Transparent"
                      active={isTransparentActive}
                      onClick={handleTransparentSelect}
                      checkerboard
                    />
                    {BACKGROUND_COLOR_PRESETS.map((preset) => (
                      <BgSwatch
                        key={preset.value}
                        label={preset.name}
                        active={isColorActive(preset.value)}
                        onClick={() => handleColorSelect(preset.value)}
                        color={preset.value}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => bgImageInputRef.current?.click()}
                    className="mt-4 w-full flex items-center justify-center gap-2 font-body text-xs font-semibold text-iris-violet border border-dashed border-iris-violet/40 rounded-buttons py-2.5 hover:bg-iris-violet/[0.04] hover:border-iris-violet transition-colors duration-150"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Upload custom background image
                  </button>
                  <input
                    ref={bgImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Empty state — a genuine dropzone card (not just a bare circle):
// a dashed-bordered container that lights up on drag-over, with the
// avatar circle + rotating gradient ring living inside it.
// ─────────────────────────────────────────────────────────────
function EmptyDropzone({
  status,
  isDragOver,
  progressPct,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  photoInputRef,
  onFileChange,
}) {
  const isIdle = status === "idle";

  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`group flex flex-col items-center text-center rounded-cards border-2 border-dashed px-6 py-9 transition-colors duration-150 ${
        isDragOver ? "border-iris-violet bg-iris-violet/[0.04]" : "border-mist bg-soft-snow/60"
      }`}
    >
      <div className="relative shrink-0 w-24 h-24 mb-5">
        {isIdle && (
          <span
            className="absolute -inset-1.5 rounded-full rf-ring-rotate pointer-events-none"
            style={{
              background: "conic-gradient(from 0deg, #7451f2, #e0e0e0, #7451f2)",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px))",
            }}
          />
        )}
        {isDragOver && (
          <span className="absolute -inset-1.5 rounded-full border-2 border-dashed border-iris-violet rf-ring-idle pointer-events-none" />
        )}

        <button
          type="button"
          onClick={onClick}
          className={`relative w-24 h-24 rounded-full overflow-hidden border bg-paper-white flex items-center justify-center transition-colors duration-150 ${
            isDragOver ? "border-iris-violet" : "border-mist"
          } ${isIdle ? "cursor-pointer" : "cursor-default"}`}
        >
          <svg
            className="w-8 h-8 text-mist absolute transition-opacity duration-200 group-hover:opacity-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
          <svg
            className="w-8 h-8 text-iris-violet absolute opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12"
            />
          </svg>

          {status === "removing" && (
            <div className="absolute inset-0 bg-graphite-ink/60 flex flex-col items-center justify-center gap-1 overflow-hidden">
              <span
                className="absolute inset-y-0 w-1/2 rf-shimmer-sweep pointer-events-none"
                style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)" }}
              />
              <div className="w-7 h-7 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="font-body text-[10px] text-paper-white font-medium">{progressPct}%</span>
            </div>
          )}
        </button>
      </div>

      <p className="font-body text-sm text-slate mb-4 max-w-xs">
        Add a professional photo — background removal and custom
        backgrounds included.
      </p>
      <UploadButton label="Upload Photo" onClick={onClick} />
      <p className="font-body text-[11px] text-fog mt-3">
        Drag &amp; drop, or PNG/JPG up to {MAX_FILE_SIZE_MB}MB
      </p>
      <input ref={photoInputRef} type="file" accept="image/*" onChange={onFileChange} className="hidden" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// A single background swatch — bigger, labeled, and clearly shows which
// one is currently active (violet ring + check overlay) instead of every
// swatch looking identical.
// ─────────────────────────────────────────────────────────────
function BgSwatch({ label, color, checkerboard, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className="flex flex-col items-center gap-1.5 group"
    >
      <span
        className={`relative w-11 h-11 rounded-cards border overflow-hidden transition-all duration-150 ${
          active
            ? "ring-2 ring-iris-violet ring-offset-2 border-transparent"
            : "border-mist/60 group-hover:border-iris-violet/50"
        }`}
        style={
          checkerboard
            ? {
                backgroundImage:
                  "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                backgroundSize: "8px 8px",
                backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                backgroundColor: "#ffffff",
              }
            : { backgroundColor: color }
        }
      >
        {active && (
          <span className="rf-swatch-check absolute inset-0 flex items-center justify-center bg-graphite-ink/25">
            <svg className="w-4 h-4 text-white drop-shadow" fill="none" viewBox="0 0 20 20" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 10l3.5 3.5L16 5" />
            </svg>
          </span>
        )}
      </span>
      <span className="font-body text-[10px] text-ash leading-none truncate max-w-[52px]">{label}</span>
    </button>
  );
}

function UploadButton({ label, onClick, compact, fullWidth }) {
  return (
    <button
      onClick={onClick}
      className={`group font-body font-semibold transition-colors duration-150 inline-flex items-center justify-center gap-2 ${
        fullWidth ? "w-full" : ""
      } ${
        compact
          ? "text-xs text-graphite-ink border border-mist rounded-buttons px-3 py-1.5 hover:bg-graphite-ink hover:text-paper-white hover:border-graphite-ink"
          : "text-sm text-paper-white bg-graphite-ink rounded-buttons px-4 py-2.5 hover:bg-slate"
      }`}
    >
      <svg
        className="w-3.5 h-3.5 transition-transform duration-200 group-hover:-translate-y-0.5"
        style={{ transitionTimingFunction: "cubic-bezier(.34,1.56,.64,1)" }}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 8.25L12 3.75m0 0L7.5 8.25M12 3.75v12"
        />
      </svg>
      {label}
    </button>
  );
}

function LockedPhotoEditor() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-4 bg-paper-white border border-mist rounded-cards px-4 py-3 text-left
                   hover:border-iris-violet/40 hover:bg-iris-violet/[0.03] transition-colors duration-150
                   focus:outline-none focus-visible:ring-2 focus-visible:ring-iris-violet/40 focus-visible:ring-offset-2"
      >
        <div className="shrink-0 w-12 h-12 rounded-full border border-mist bg-soft-snow flex items-center justify-center">
          <svg
            className="w-5 h-5 text-ash"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.5 10.5V7.5a4.5 4.5 0 10-9 0v3m-1.5 0h12A1.5 1.5 0 0119.5 12v6a1.5 1.5 0 01-1.5 1.5h-12A1.5 1.5 0 014.5 18v-6A1.5 1.5 0 016 10.5z"
            />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-ash">
            Profile Photo
          </p>
          <p className="font-body text-[13px] text-slate truncate">
            Premium feature — see how it works
          </p>
        </div>

        <span className="font-body text-xs font-semibold text-iris-violet shrink-0">
          See →
        </span>
      </button>

      {showModal && (
        <PhotoFeatureShowcaseModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}