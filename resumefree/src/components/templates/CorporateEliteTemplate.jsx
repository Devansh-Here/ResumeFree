// src/components/templates/CorporateEliteTemplate.jsx

import { getFontStack } from "../../utils/fontOptions";
import { normalizeBandColor, getBandTextColor, getCorporateSidebarColor, getBandPalette } from "../../utils/bandColors";

// ---- Color helpers (kept local to this file for now — safe, dependency-
// free RGB blending in plain JS rather than CSS `color-mix()`, since
// Puppeteer's bundled Chromium version support for `color-mix()` isn't
// guaranteed and this template's PDF output has its own historical bug
// chain (Section 5k/5o of the handoff). If this pattern is propagated to
// the other 3 supportsPhoto templates, consider moving these two
// functions into a shared `utils/colorBlend.js` instead of duplicating. ----

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

// Blends `hex` toward `baseHex` by `baseRatio` (0–1). Used to tint the dark
// sidebar with the user's chosen accent color while always keeping it dark
// enough for white text to stay readable, regardless of how light/saturated
// the picked accent color is. Also reused below to derive lighter tints of
// the user's chosen textColor for secondary/tertiary text tones.
function blendTowardBase(hex, baseHex, baseRatio) {
  const a = hexToRgb(hex);
  const b = hexToRgb(baseHex);
  const r = Math.round(a.r * (1 - baseRatio) + b.r * baseRatio);
  const g = Math.round(a.g * (1 - baseRatio) + b.g * baseRatio);
  const bl = Math.round(a.b * (1 - baseRatio) + b.b * baseRatio);
  return `rgb(${r}, ${g}, ${bl})`;
}

// Accent color at a given opacity, for tinted chip/tag backgrounds sitting
// on top of the dark sidebar.
function accentAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Density scale (theme.density) — controls spacing/line-height across
// the whole template. Kept as one lookup table so every density-affected
// value stays in sync instead of scattering magic numbers through JSX. ──
const DENSITY_SCALE = {
  compact: { lineHeight: "1.35", padding: "22px 20px", sectionGap: "10px", itemGap: "8px" },
  balanced: { lineHeight: "1.5", padding: "30px 28px", sectionGap: "14px", itemGap: "12px" },
  spacious: { lineHeight: "1.7", padding: "38px 34px", sectionGap: "20px", itemGap: "18px" },
};

// dividerStyle: 'line' | 'dots' | 'none' — the small marker under each
// section heading. headingStyle: 'normal' | 'uppercase' — casing of the
// heading text itself. headingColor only applies in the LIGHT (main
// content) zone. Sidebar headings use their band's contrast color instead.
function SectionHeading({ title, dark, accentColor, headingColor, headingStyle, dividerStyle, headingFontStack, density, sidebarHeadingColor }) {
  return (
    <div className="mb-2" style={{ marginTop: density.sectionGap }}>
      <div className="flex items-center gap-1.5">
        {/* Sidebar callers supply a contrast-adjusted accent for custom bands. */}
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className="text-[10px] font-bold tracking-[0.15em]"
          style={{
            color: dark ? sidebarHeadingColor : headingColor,
            fontFamily: headingFontStack,
            textTransform: headingStyle === "uppercase" ? "uppercase" : "none",
          }}
        >
          {title}
        </span>
      </div>
      {dividerStyle === "line" && (
        <div
          className="h-[2px] w-8 mt-1 ml-3"
          style={{ backgroundColor: accentColor }}
        />
      )}
      {dividerStyle === "dots" && (
        <div className="flex gap-1 mt-1.5 ml-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          ))}
        </div>
      )}
      {/* dividerStyle === 'none' → nothing rendered */}
    </div>
  );
}

function EmptyField({ text, color = "#cbd5e1" }) {
  return <span className="italic" style={{ color }}>{text}</span>;
}

export default function CorporateEliteTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  // ── Theme fields, all with safe fallbacks matching resumeStore.js's
  // DEFAULT_RESUME.theme, for resumes saved before these fields existed. ──
  const accentColor = resume.theme?.accentColor || "#7451f2";
  const customBandColor = normalizeBandColor(resume.theme?.bandColor);
  const sidebarText = customBandColor ? getBandTextColor(customBandColor) : "#ffffff";
  const bandPalette = customBandColor ? getBandPalette(customBandColor, accentColor) : null;
  const sidebarAccent = bandPalette?.marker || accentColor;
  const linkColor = resume.theme?.linkColor || bandPalette?.link || accentColor;
  const backgroundColor = resume.theme?.backgroundColor || "#ffffff"; // null = template default (white)
  const textColor = resume.theme?.textColor || "#272727";
  const headingColor = resume.theme?.headingColor || textColor; // null = inherit textColor
  const headingFontKey = resume.theme?.fontFamily || "georgia";
  const bodyFontKey = resume.theme?.bodyFontFamily || "arial";
  const headingFontStack = getFontStack(headingFontKey);
  const bodyFontStack = getFontStack(bodyFontKey);
  const headingStyle = resume.theme?.headingStyle || "normal";
  const dividerStyle = resume.theme?.dividerStyle || "line";
  const density = DENSITY_SCALE[resume.theme?.density] || DENSITY_SCALE.balanced;
  const photoBorder = resume.theme?.photoBorder || { style: "circle", color: null, width: 2 };

  const photoUrl = personal.photo?.processedDataUrl || null;
  const nameInitial = personal.name?.trim()?.[0]?.toUpperCase() || "?";

  // A custom band color is exact; Reset restores the original dark accent blend.
  // Sidebar text adapts independently of the main-column text/heading colors.
  const sidebarBg = customBandColor || getCorporateSidebarColor(accentColor);
  const sidebarSecondary = customBandColor ? sidebarText : "#cbd5e1";
  const sidebarMuted = customBandColor ? sidebarText : "#94a3b8";
  const sidebarHeadingColor = customBandColor ? sidebarText : "rgba(255,255,255,0.9)";
  const chipBg = bandPalette?.chipBackground || accentAlpha(accentColor, 0.22);
  const chipText = bandPalette?.chipText || "#e2e8f0";

  // ── textColor-derived tints for the MAIN (light) content area only. ──
  // theme.textColor governs the primary ink color of the light content
  // column. Secondary/tertiary text (company names, dates, meta info) are
  // lighter tints of the SAME color rather than independent hardcoded
  // hues, so changing textColor coordinates the whole main column
  // consistently. The sidebar derives its own readable palette from bandColor.
  const textPrimary = textColor;
  const textSecondary = blendTowardBase(textColor, "#ffffff", 0.35); // e.g. company name, tech stack
  const textBody = blendTowardBase(textColor, "#ffffff", 0.15); // bullet text

  // ── Photo border, derived from theme.photoBorder ──
  const borderColor = photoBorder.color || sidebarAccent;
  const borderWidth = photoBorder.style === "none" ? 0 : photoBorder.width ?? 2;
  const borderRadius =
    photoBorder.style === "square" ? "8px" : photoBorder.style === "none" ? "0px" : "9999px";

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 ||
    skills.tools.length > 0 ||
    skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  const allSkills = [...skills.technical, ...skills.tools, ...skills.languages];

  return (
    <div
      className="shadow-md rounded-sm w-full overflow-hidden"
      style={{
        backgroundColor,
        fontFamily: bodyFontStack,
        fontSize: "11px",
        lineHeight: density.lineHeight,
        minHeight: "842px",
      }}
    >
      {/* The top strip shares the independent band color when one is set. */}
      <div className="h-[5px] w-full" style={{ backgroundColor: customBandColor || accentColor }} />

      <div className="flex" style={{ minHeight: "837px" }}>
        {/* Sidebar text follows band contrast, independently of main textColor. */}
        <div
          className="flex-shrink-0"
          style={{ width: "34%", backgroundColor: sidebarBg, color: sidebarText, padding: density.padding }}
        >
          {/* Photo slot. Shape/border now driven by theme.photoBorder
              (style/color/width) instead of a hardcoded circle. Shows
              uploaded+processed photo if present, otherwise a neutral
              initial-letter placeholder in the same shape/frame so the
              layout stays consistent whether or not a photo is added. */}
          <div
            className="w-16 h-16 overflow-hidden flex items-center justify-center mb-3 flex-shrink-0"
            style={{
              backgroundColor: photoUrl ? "transparent" : accentAlpha(sidebarText, 0.08),
              border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : "none",
              borderRadius,
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={personal.name || "Profile photo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-[20px]" style={{ color: sidebarSecondary }}>{nameInitial}</span>
            )}
          </div>

          <h1
            className="text-[26px] leading-tight mb-1"
            style={{ fontFamily: headingFontStack, color: sidebarText }}
          >
            {personal.name || <EmptyField text="Your Name" color={sidebarSecondary} />}
          </h1>
          <div className="h-[2px] w-12 mb-4" style={{ backgroundColor: sidebarAccent }} />

          <div className="space-y-1 text-[10px]" style={{ color: sidebarSecondary }}>
            {personal.email && <div>{personal.email}</div>}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.address && <div>{personal.address}</div>}
            {!personal.email && !personal.phone && !personal.address && (
              <EmptyField text="email · phone · city" color={sidebarSecondary} />
            )}
          </div>

          {(personal.linkedin || personal.github || personal.portfolio) && (
            <div className="space-y-1 mt-2 text-[10px]" style={{ color: linkColor }}>
              {personal.linkedin && <div>linkedin.com/in/{personal.linkedin}</div>}
              {personal.github && <div>github.com/{personal.github}</div>}
              {personal.portfolio && <div>{personal.portfolio}</div>}
            </div>
          )}

          {hasSkills && (
            <>
              <SectionHeading
                title="Skills"
                dark
                accentColor={sidebarAccent}
                headingColor={headingColor}
                headingStyle={headingStyle}
                dividerStyle={dividerStyle}
                headingFontStack={headingFontStack}
                density={density}
                sidebarHeadingColor={sidebarHeadingColor}
              />
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: chipBg, color: chipText }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          {hasEducation && (
            <>
              <SectionHeading
                title="Education"
                dark
                accentColor={sidebarAccent}
                headingColor={headingColor}
                headingStyle={headingStyle}
                dividerStyle={dividerStyle}
                headingFontStack={headingFontStack}
                density={density}
                sidebarHeadingColor={sidebarHeadingColor}
              />
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-[10.5px]" style={{ color: sidebarText }}>
                      {edu.degree || <EmptyField text="Degree" color={sidebarSecondary} />}
                    </div>
                    {edu.college && (
                      <div className="text-[10px]" style={{ color: sidebarSecondary }}>{edu.college}</div>
                    )}
                    <div className="text-[9.5px] mt-0.5" style={{ color: sidebarMuted }}>
                      {edu.year}
                      {edu.cgpa && <span> · {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Main (light content area — driven by theme.textColor) ── */}
        <div className="flex-1" style={{ padding: density.padding, color: textPrimary }}>
          {hasExperience && (
            <>
              <SectionHeading
                title="Experience"
                accentColor={accentColor}
                headingColor={headingColor}
                headingStyle={headingStyle}
                dividerStyle={dividerStyle}
                headingFontStack={headingFontStack}
                density={density}
                sidebarHeadingColor={sidebarHeadingColor}
              />
              <div className="flex flex-col" style={{ gap: density.itemGap }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-[11.5px]">
                          {exp.role || <EmptyField text="Role" />}
                        </span>
                        {exp.company && (
                          <span style={{ color: textSecondary }}> · {exp.company}</span>
                        )}
                      </div>
                      {exp.duration && (
                        <span
                          className="flex-shrink-0 text-[10px]"
                          style={{ color: textSecondary }}
                        >
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    {exp.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-3">
                        {exp.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                              <span
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: accentColor }}
                              >
                                ▪
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {hasProjects && (
            <>
              <SectionHeading
                title="Projects"
                accentColor={accentColor}
                headingColor={headingColor}
                headingStyle={headingStyle}
                dividerStyle={dividerStyle}
                headingFontStack={headingFontStack}
                density={density}
                sidebarHeadingColor={sidebarHeadingColor}
              />
              <div className="flex flex-col" style={{ gap: density.itemGap }}>
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[11.5px]">
                        {proj.name || <EmptyField text="Project Name" />}
                      </span>
                      {proj.techStack.length > 0 && (
                        <span
                          className="text-[10px] flex-shrink-0"
                          style={{ color: accentColor }}
                        >
                          {proj.techStack.join(", ")}
                        </span>
                      )}
                    </div>
                    {proj.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-3">
                        {proj.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                              <span
                                className="flex-shrink-0 mt-0.5"
                                style={{ color: accentColor }}
                              >
                                ▪
                              </span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}

          {!personal.name && !hasEducation && !hasExperience && !hasSkills && !hasProjects && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-[#cbd5e1] text-sm">
                Start filling the form —<br />your resume will appear here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
