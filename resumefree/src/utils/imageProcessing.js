// src/utils/imageProcessing.js
//
// Reusable photo personalization engine — background removal + compositing.
// Built ONCE here so every premium resume template can just consume
// `resume.personalInfo.photo.processedDataUrl` without re-implementing this.
//
// Uses @imgly/background-removal — free, client-side (WASM), ₹0 cost.
// Install: npm install @imgly/background-removal

import { removeBackground } from "@imgly/background-removal";

/**
 * Convert a File (from an <input type="file"> upload) into a base64 dataURL.
 * @param {File} file
 * @returns {Promise<string>} dataUrl
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error("No file provided"));
      return;
    }
    if (!file.type.startsWith("image/")) {
      reject(new Error("File must be an image"));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Removes the background from a photo, leaving a transparent PNG.
 * This is the slow step (2-5s typically) — caller should show a loading state.
 *
 * @param {string} imageDataUrl - original uploaded photo as a dataURL
 * @param {object} [options]
 * @param {(progress: {key: string, current: number, total: number}) => void} [options.onProgress]
 * @returns {Promise<string>} transparent PNG as a dataURL
 */
export async function removeImageBackground(imageDataUrl, options = {}) {
  if (!imageDataUrl) {
    throw new Error("removeImageBackground: imageDataUrl is required");
  }

  try {
    const config = {
      // @imgly/background-removal supports a progress callback so the UI
      // can show a real (not fake) progress state while the WASM model
      // downloads + runs the first time.
      progress: (key, current, total) => {
        if (options.onProgress) {
          options.onProgress({ key, current, total });
        }
      },
    };

    const resultBlob = await removeBackground(imageDataUrl, config);
    const transparentDataUrl = await blobToDataUrl(resultBlob);
    return transparentDataUrl;
  } catch (err) {
    console.error("Background removal failed:", err);
    throw new Error(
      "Could not remove background. Please try a different photo (clear, single-person, good lighting works best)."
    );
  }
}

/**
 * Composites a transparent (background-removed) photo onto a new background —
 * either a solid color or another uploaded image — and returns a flattened
 * dataURL ready to drop straight into a resume template / PDF render.
 *
 * @param {string} transparentDataUrl - PNG with transparent background
 * @param {'none' | 'color' | 'image'} backgroundType
 * @param {string|null} backgroundValue - hex color (e.g. "#059669") when
 *   backgroundType === 'color', or a background image dataURL when
 *   backgroundType === 'image'. Ignored when backgroundType === 'none'.
 * @param {object} [options]
 * @param {number} [options.size=512] - output canvas is a square, size x size
 * @returns {Promise<string>} final composited dataURL (image/png)
 */
export async function applyNewBackground(
  transparentDataUrl,
  backgroundType = "none",
  backgroundValue = null,
  options = {}
) {
  const size = options.size || 512;

  const subjectImg = await loadImage(transparentDataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // 1. Draw the background layer first.
  if (backgroundType === "color" && backgroundValue) {
    ctx.fillStyle = backgroundValue;
    ctx.fillRect(0, 0, size, size);
  } else if (backgroundType === "image" && backgroundValue) {
    const bgImg = await loadImage(backgroundValue);
    drawCover(ctx, bgImg, size, size);
  } else {
    // 'none' → transparent background, useful if the template itself
    // supplies a background (e.g. a colored circle/frame in CSS).
    ctx.clearRect(0, 0, size, size);
  }

  // 2. Draw the subject (background-removed photo) on top, "contain"-fitted
  //    so the person isn't stretched or cropped oddly.
  drawContain(ctx, subjectImg, size, size);

  return canvas.toDataURL("image/png");
}

// ---------- internal helpers ----------

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to convert result to dataURL"));
    reader.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

// Cover-fit: fills the entire canvas, cropping overflow (good for backgrounds).
function drawCover(ctx, img, targetW, targetH) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetW / targetH;
  let sx, sy, sw, sh;

  if (imgRatio > targetRatio) {
    sh = img.height;
    sw = sh * targetRatio;
    sx = (img.width - sw) / 2;
    sy = 0;
  } else {
    sw = img.width;
    sh = sw / targetRatio;
    sx = 0;
    sy = (img.height - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH);
}

// Contain-fit: fits the whole subject inside the canvas without cropping
// (good for the person's photo, so faces never get cut off).
function drawContain(ctx, img, targetW, targetH) {
  const imgRatio = img.width / img.height;
  const targetRatio = targetW / targetH;
  let dw, dh, dx, dy;

  if (imgRatio > targetRatio) {
    dw = targetW;
    dh = dw / imgRatio;
    dx = 0;
    dy = (targetH - dh) / 2;
  } else {
    dh = targetH;
    dw = dh * imgRatio;
    dx = (targetW - dw) / 2;
    dy = 0;
  }

  ctx.drawImage(img, dx, dy, dw, dh);
}

/**
 * Convenience preset colors for the "Add Background" step — professional,
 * ATS-safe, resume-appropriate tones. Consumed by PhotoEditorPanel.jsx.
 */
export const BACKGROUND_COLOR_PRESETS = [
  { name: "Emerald", value: "#059669" },
  { name: "Navy", value: "#0a1628" },
  { name: "Slate", value: "#1e3a5f" },
  { name: "White", value: "#ffffff" },
  { name: "Soft Grey", value: "#e8edf2" },
  { name: "Warm Sand", value: "#f5f0e8" },
];