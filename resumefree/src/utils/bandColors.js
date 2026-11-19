// Shared by customization controls and the server-rendered templates.
export function normalizeBandColor(value) {
  if (typeof value !== "string" || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(value)) return null;
  const hex = value.slice(1).toLowerCase();
  return "#" + (hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex);
}

function channels(hex) {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
}

export function getCorporateSidebarColor(accentColor) {
  const accent = channels(normalizeBandColor(accentColor) || "#7451f2");
  const navy = channels("#0a1628");
  return "#" + accent.map((v, i) => Math.round(v * 0.3 + navy[i] * 0.7).toString(16).padStart(2, "0")).join("");
}

function luminance(backgroundColor) {
  const linear = channels(normalizeBandColor(backgroundColor) || "#000000").map((v) => {
    const channel = v / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
  return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function getBandTextColor(backgroundColor) {
  const light = luminance(backgroundColor);
  return (1.05 / (light + 0.05)) >= ((light + 0.05) / 0.05) ? "#ffffff" : "#000000";
}

function blend(color, target, amount) {
  const a = channels(color);
  const b = channels(target);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * amount).toString(16).padStart(2, "0")).join("");
}

function contrast(a, b) {
  const first = luminance(a);
  const second = luminance(b);
  return (Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05);
}

// Preserve the chosen accent hue where readable, otherwise tint it toward
// the band's contrasting ink. Pills are opaque so PDF and preview agree.
export function getBandPalette(backgroundColor, accentColor) {
  const background = normalizeBandColor(backgroundColor) || "#ffffff";
  const accent = normalizeBandColor(accentColor) || "#7451f2";
  const ink = getBandTextColor(background);
  const readableAccent = (minimum) => {
    for (let step = 0; step <= 20; step += 1) {
      const candidate = blend(accent, ink, step / 20);
      if (contrast(candidate, background) >= minimum) return candidate;
    }
    return ink;
  };
  const marker = readableAccent(3);
  const chipBackground = blend(background, marker, 0.24);
  return {
    marker,
    link: readableAccent(4.5),
    chipBackground,
    chipText: getBandTextColor(chipBackground),
  };
}
