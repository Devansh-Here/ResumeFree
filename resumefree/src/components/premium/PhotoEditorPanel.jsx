// src/components/premium/PhotoEditorPanel.jsx
//
// Premium-only panel: upload a photo → remove its background (free,
// client-side, via @imgly/background-removal) → apply a new solid color
// or custom background image → live preview → auto-saved to resumeStore.
//
// Session-only detail worth knowing: the *transparent* (bg-removed)
// intermediate image is kept in local component state only, NOT persisted
// to localStorage (to avoid bloating it with an extra full-size image
// copy). Only the final composited `processedDataUrl` gets persisted.
// If the user reloads the page and wants to change the background again,
// we transparently re-run removal from the persisted `originalDataUrl`
// (see `handleEditBackground`) — costs another 2-5s, which is an
// acceptable tradeoff for a much smaller localStorage footprint.

import { useState, useRef } from "react";
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

export default function PhotoEditorPanel() {
  const isPremium = useAuthStore((s) => s.isPremium());
  const photo = useResumeStore((s) => s.resume.personal.photo);
  const updatePhoto = useResumeStore((s) => s.updatePhoto);
  const clearPhoto = useResumeStore((s) => s.clearPhoto);

  const [status, setStatus] = useState("idle"); // idle | removing | ready | error
  const [errorMsg, setErrorMsg] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [transparentDataUrl, setTransparentDataUrl] = useState(null); // session-only

  const photoInputRef = useRef(null);
  const bgImageInputRef = useRef(null);

  if (!isPremium) {
    return <LockedPhotoEditor />;
  }

  const hasPhoto = !!photo?.originalDataUrl;
  const hasTransparent = !!transparentDataUrl;

  // ── Upload a fresh photo → immediately kick off bg removal ──
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

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

  // ── Re-run removal on the already-uploaded photo ────────────
  // (used after a page reload, when we only have originalDataUrl saved
  // and the transparent intermediate was never persisted)
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

    // Compose with whatever background was previously chosen (or 'none'
    // as a sensible first-time default) and save immediately.
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

  return (
    <div className="bg-white border border-[#cbd5e1]/60 rounded-3xl p-5">
      <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-4">
        Profile Photo
      </label>

      <div className="flex items-start gap-5">
        {/* Preview circle */}
        <div className="relative shrink-0 w-24 h-24 rounded-full overflow-hidden border border-[#cbd5e1] bg-[#f8fafc] flex items-center justify-center">
          {photo?.processedDataUrl ? (
            <img
              src={photo.processedDataUrl}
              alt="Resume profile"
              className="w-full h-full object-cover"
            />
          ) : (
            <svg
              className="w-8 h-8 text-[#cbd5e1]"
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

          {status === "removing" && (
            <div className="absolute inset-0 bg-[#0a1628]/60 flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span className="text-[10px] text-white font-medium">{progressPct}%</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 min-w-0">
          {!hasPhoto && (
            <>
              <p className="text-sm text-[#1e3a5f] mb-3">
                Add a professional photo — background removal and custom
                backgrounds included.
              </p>
              <UploadButton
                label="Upload Photo"
                onClick={() => photoInputRef.current?.click()}
              />
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </>
          )}

          {hasPhoto && (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                <UploadButton
                  label="Change Photo"
                  onClick={() => photoInputRef.current?.click()}
                  compact
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
                    className="text-xs font-semibold text-[#059669] hover:underline px-1"
                  >
                    Edit Background
                  </button>
                )}

                <button
                  onClick={handleRemovePhoto}
                  className="text-xs font-medium text-[#4a6fa5] hover:text-[#be123c] transition-colors duration-150 px-1"
                >
                  Remove Photo
                </button>
              </div>

              {status === "error" && (
                <p className="text-xs text-[#be123c] mb-3">{errorMsg}</p>
              )}

              {hasTransparent && status === "ready" && (
                <div>
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-2">
                    Background
                  </p>
                  <div className="grid grid-cols-8 gap-2 mb-3">
                    <button
                      onClick={handleTransparentSelect}
                      title="Transparent"
                      className="w-7 h-7 rounded-full border border-[#cbd5e1] relative overflow-hidden"
                      style={{
                        backgroundImage:
                          "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)",
                          backgroundSize: "8px 8px",
                          backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                        }}
                    />
                    {BACKGROUND_COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => handleColorSelect(preset.value)}
                        title={preset.name}
                        className="w-7 h-7 rounded-full border border-[#cbd5e1]/50"
                        style={{ backgroundColor: preset.value }}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => bgImageInputRef.current?.click()}
                    className="text-xs font-semibold text-[#059669] hover:underline"
                  >
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function UploadButton({ label, onClick, compact }) {
  return (
    <button
      onClick={onClick}
      className={
        compact
          ? "text-xs font-semibold text-[#0a1628] border border-[#cbd5e1] rounded-full px-3 py-1.5 hover:bg-[#0a1628] hover:text-white hover:border-[#0a1628] transition-colors duration-150"
          : "text-sm font-semibold text-white bg-[#0a1628] rounded-full px-4 py-2.5 hover:bg-[#1e3a5f] transition-colors duration-150"
      }
    >
      {label}
    </button>
  );
}

function LockedPhotoEditor() {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div
        className="relative bg-white border border-[#cbd5e1]/60 rounded-3xl p-5 overflow-hidden cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-4 opacity-40">
          Profile Photo
        </label>
        <div className="flex items-start gap-5 opacity-40 pointer-events-none select-none blur-[1px]">
          <div className="shrink-0 w-24 h-24 rounded-full border border-[#cbd5e1] bg-[#f8fafc]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-[#e8edf2] rounded-full" />
            <div className="h-8 w-32 bg-[#e8edf2] rounded-full" />
          </div>
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] gap-2 px-4 text-center transition-colors duration-150 group-hover:bg-white/80">
          <svg
            className="w-5 h-5 text-[#4a6fa5]"
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
          <p className="text-xs text-[#1e3a5f] font-medium">
            Photo + background removal is a premium feature
          </p>
          <span className="text-xs font-semibold text-[#059669] group-hover:underline">
            See how it works →
          </span>
        </div>
      </div>

      {showModal && (
        <PhotoFeatureShowcaseModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
}