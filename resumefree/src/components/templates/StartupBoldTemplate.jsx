// src/components/templates/StartupBoldTemplate.jsx
import { getFontStack } from "../../utils/fontOptions";
import { normalizeBandColor, getBandTextColor } from "../../utils/bandColors";

// ── Theme-derived color helpers (same pattern as CorporateEliteTemplate.jsx) ──
function hexToRgb(hex) {
  if (!hex) return { r: 0, g: 0, b: 0 };
  let h = hex.replace("#", "");
  if (h.length === 3) h = h.split("").map((c) => c + c).join("");
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  const toHex = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function blendTowardBase(hex, baseHex, amount) {
  const c1 = hexToRgb(hex);
  const c2 = hexToRgb(baseHex);
  return rgbToHex({
    r: c1.r + (c2.r - c1.r) * amount,
    g: c1.g + (c2.g - c1.g) * amount,
    b: c1.b + (c2.b - c1.b) * amount,
  });
}

function accentAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ── Density scale (compact / balanced / spacious) ──
const DENSITY_SCALE = {
  compact: {
    lineHeight: "1.35",
    contentPadding: "18px 30px",
    headerPadding: "20px 30px",
    sectionGap: "10px",
    itemGap: "8px",
  },
  balanced: {
    lineHeight: "1.5",
    contentPadding: "24px 34px",
    headerPadding: "26px 34px",
    sectionGap: "14px",
    itemGap: "12px",
  },
  spacious: {
    lineHeight: "1.65",
    contentPadding: "30px 40px",
    headerPadding: "32px 40px",
    sectionGap: "20px",
    itemGap: "16px",
  },
};

function SectionHeading({ title, accentColor, headingColor, headingFontStack, uppercase, divider, topGap }) {
  return (
    <div style={{ marginTop: topGap, marginBottom: "8px" }}>
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: accentColor }} />
        <span
          className={`text-[10.5px] font-bold tracking-[0.1em] ${uppercase ? "uppercase" : ""}`}
          style={{ fontFamily: headingFontStack, color: headingColor }}
        >
          {title}
        </span>
      </div>
      {divider === "line" && (
        <div className="h-px mt-1.5 ml-4" style={{ backgroundColor: accentAlpha(accentColor, 0.25) }} />
      )}
      {divider === "dots" && (
        <div className="flex gap-1 mt-1.5 ml-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1 h-1 rounded-full"
              style={{ backgroundColor: accentAlpha(accentColor, 0.4) }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyField({ text, color = "#cbd5e1" }) {
  return <span className="italic" style={{ color }}>{text}</span>;
}

export default function StartupBoldTemplate({ resume }) {
  const { personal, education, experience, skills, projects, theme = {} } = resume;

  // ── Resolve theme fields (with safe fallbacks matching resumeStore.js DEFAULT_RESUME.theme) ──
  const accentColor = theme.accentColor || "#7451f2";
  const customBandColor = normalizeBandColor(theme.bandColor);
  const headerBg = customBandColor || accentColor;
  const headerText = customBandColor ? getBandTextColor(customBandColor) : "#ffffff";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#272727";
  const headingColor = theme.headingColor || textColor;
  const headingFontStack = getFontStack(theme.fontFamily || "georgia");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const uppercaseHeadings = theme.headingStyle === "uppercase";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const dividerStyle = theme.dividerStyle || "line";

  // The header is its own contrast zone. Custom bands choose readable default
  // text/links, while an explicit linkColor remains the user's override.
  const linkColorOnHeader = theme.linkColor || (customBandColor ? headerText : "rgba(255,255,255,0.92)");

  const textSecondary = blendTowardBase(textColor, "#ffffff", 0.4); // meta labels (duration, year)
  const textBody = blendTowardBase(textColor, "#ffffff", 0.15); // bullet body text
  const contactTint = customBandColor ? headerText : blendTowardBase(accentColor, "#ffffff", 0.75); // header contact-info tint

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  const chip = (text, bg, color) => (
    <span
      className="text-[9.5px] px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {text}
    </span>
  );

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
      {/* ── Header band ── */}
      <div style={{ backgroundColor: headerBg, padding: density.headerPadding }}>
        <h1
          className="text-[24px] font-bold tracking-tight"
          style={{ fontFamily: headingFontStack, color: headerText }}
        >
          {personal.name || <EmptyField text="Your Name" color={customBandColor ? headerText : "#cbd5e1"} />}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px]" style={{ color: contactTint }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
        </div>
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div
            className="flex flex-wrap gap-x-3 mt-1 text-[10px] font-medium"
            style={{ color: linkColorOnHeader }}
          >
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      <div style={{ padding: density.contentPadding, color: headingColor }}>
        {hasSkills && (
          <>
            <SectionHeading
              title="Skills"
              accentColor={accentColor}
              headingColor={headingColor}
              headingFontStack={headingFontStack}
              uppercase={uppercaseHeadings}
              divider={dividerStyle}
              topGap={density.sectionGap}
            />
            <div className="flex flex-wrap gap-1.5">
              {skills.technical.map((s, i) =>
                <span key={`t-${i}`}>{chip(s, accentAlpha(accentColor, 0.14), blendTowardBase(accentColor, "#000000", 0.35))}</span>
              )}
              {skills.tools.map((s, i) =>
                <span key={`to-${i}`}>{chip(s, accentAlpha(accentColor, 0.07), blendTowardBase(accentColor, "#000000", 0.2))}</span>
              )}
              {skills.languages.map((s, i) =>
                <span key={`l-${i}`}>{chip(s, blendTowardBase(textColor, "#ffffff", 0.94), textSecondary)}</span>
              )}
            </div>
          </>
        )}

        {hasExperience && (
          <>
            <SectionHeading
              title="Experience"
              accentColor={accentColor}
              headingColor={headingColor}
              headingFontStack={headingFontStack}
              uppercase={uppercaseHeadings}
              divider={dividerStyle}
              topGap={density.sectionGap}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: density.itemGap }}>
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[11.5px]" style={{ color: headingColor }}>
                      {exp.role || <EmptyField text="Role" />}
                      {exp.company && (
                        <span className="font-medium" style={{ color: accentColor }}> @ {exp.company}</span>
                      )}
                    </span>
                    {exp.duration && (
                      <span
                        className="flex-shrink-0 text-[9.5px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: blendTowardBase(textColor, "#ffffff", 0.95), color: textSecondary }}
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
                            <span className="flex-shrink-0 mt-0.5" style={{ color: accentColor }}>→</span>
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
              headingFontStack={headingFontStack}
              uppercase={uppercaseHeadings}
              divider={dividerStyle}
              topGap={density.sectionGap}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: density.itemGap }}>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className="rounded-xl p-3"
                  style={{
                    border: `1px solid ${blendTowardBase(textColor, "#ffffff", 0.8)}`,
                    backgroundColor: blendTowardBase(textColor, "#ffffff", 0.97),
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[11px]" style={{ color: headingColor }}>
                      {proj.name || <EmptyField text="Project Name" />}
                    </span>
                  </div>
                  {proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.techStack.map((t, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: accentAlpha(accentColor, 0.08),
                            color: blendTowardBase(accentColor, "#000000", 0.2),
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.bullets.filter((b) => b.trim()).length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 pl-3">
                      {proj.bullets
                        .filter((b) => b.trim())
                        .map((bullet, i) => (
                          <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                            <span className="flex-shrink-0 mt-0.5" style={{ color: accentColor }}>→</span>
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

        {hasEducation && (
          <>
            <SectionHeading
              title="Education"
              accentColor={accentColor}
              headingColor={headingColor}
              headingFontStack={headingFontStack}
              uppercase={uppercaseHeadings}
              divider={dividerStyle}
              topGap={density.sectionGap}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: density.itemGap }}>
              {education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[11px]" style={{ color: headingColor }}>
                      {edu.degree || <EmptyField text="Degree" />}
                    </span>
                    {edu.college && <span style={{ color: textSecondary }}> · {edu.college}</span>}
                  </div>
                  <div className="text-right flex-shrink-0" style={{ color: textSecondary }}>
                    {edu.year} {edu.cgpa && <span>· {edu.cgpa}</span>}
                  </div>
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
  );
}
