// src/components/templates/ClassicTemplate.jsx

import { getFontStack } from "../../utils/fontOptions";

function hexToRgb(hex) {
  const clean = hex.replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex({ r, g, b }) {
  return "#" + [r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("");
}

// Plain RGB blending is compatible with the server-side PDF renderer.
function blendTowardBase(hex, baseHex, ratio) {
  const color = hexToRgb(hex);
  const base = hexToRgb(baseHex);
  return rgbToHex(Object.fromEntries(
    ["r", "g", "b"].map((channel) => [channel, Math.round(color[channel] * (1 - ratio) + base[channel] * ratio)])
  ));
}

function accentAlpha(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
}

// Balanced preserves Classic's original padding and spacing.
const DENSITY_SCALE = {
  compact: { lineHeight: "1.35", padding: "24px 28px", sectionGap: "12px", itemGap: "8px", educationGap: "6px", skillGap: "2px", bulletGap: "1px" },
  balanced: { lineHeight: "1.5", padding: "32px 36px", sectionGap: "16px", itemGap: "12px", educationGap: "10px", skillGap: "4px", bulletGap: "2px" },
  spacious: { lineHeight: "1.7", padding: "40px 44px", sectionGap: "22px", itemGap: "18px", educationGap: "16px", skillGap: "6px", bulletGap: "4px" },
};

// ── Section Divider ───────────────────────────────────────────
function SectionHeading({ title, accentColor, headingColor, headingFontStack, headingStyle, dividerStyle, density }) {
  return (
    <div className="flex items-center gap-2 mb-2" style={{ marginTop: density.sectionGap }}>
      <span
        className="text-[10px] font-bold tracking-[0.15em]"
        style={{ fontFamily: headingFontStack, color: headingColor, textTransform: headingStyle === "uppercase" ? "uppercase" : "none" }}
      >
        {title}
      </span>
      {dividerStyle === "line" && <div aria-hidden="true" className="flex-1 h-px" style={{ backgroundColor: accentColor }} />}
      {dividerStyle === "dots" && (
        <div aria-hidden="true" className="flex gap-1">
          {[0, 1, 2].map((dot) => <span key={dot} className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />)}
        </div>
      )}
    </div>
  );
}

// ── Empty placeholder ─────────────────────────────────────────
function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function ClassicTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  // Classic-specific missing-value fallbacks preserve its navy ink, sans-serif
  // headings and uppercase section labels. Explicit store defaults still win.
  // Accent is limited to dividers and links; it never fills large surfaces.
  const theme = resume.theme || {};
  const accentColor = theme.accentColor || "#7451f2";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#0a1628";
  const headingColor = theme.headingColor || textColor;
  const linkColor = theme.linkColor || accentColor;
  const headingFontStack = getFontStack(theme.fontFamily || "arial");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const headingStyle = theme.headingStyle || "uppercase";
  const dividerStyle = theme.dividerStyle || "line";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const textBody = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.15) : "#1e3a5f";
  const textSecondary = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.35) : accentAlpha("#1e3a5f", 0.7);
  const textTech = theme.textColor ? textSecondary : "#4a6fa5";
  const sectionTheme = { accentColor, headingColor, headingFontStack, headingStyle, dividerStyle, density };

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 ||
    skills.tools.length > 0 ||
    skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  return (
    <div
      className="shadow-md rounded-sm w-full"
      style={{
        fontFamily: bodyFontStack,
        backgroundColor,
        fontSize: "11px",
        lineHeight: density.lineHeight,
        color: textColor,
        padding: density.padding,
        minHeight: "842px",
      }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-3">
        <h1
          className="font-bold text-[22px] tracking-tight"
          style={{ fontFamily: headingFontStack, color: headingColor }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>

        {/* Contact line */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-[10px]" style={{ color: textBody }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>· {personal.phone}</span>}
          {personal.address && <span>· {personal.address}</span>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>

        {/* Links line */}
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap justify-center gap-x-3 mt-0.5 text-[10px]" style={{ color: linkColor }}>
            {personal.linkedin && (
              <span>linkedin.com/in/{personal.linkedin}</span>
            )}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* ── Education ── */}
      {hasEducation && (
        <>
          <SectionHeading title="Education" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.educationGap }}>
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[11px]">
                      {edu.degree || <EmptyField text="Degree" />}
                    </span>
                    {edu.college && (
                      <span style={{ color: textSecondary }}> · {edu.college}</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0" style={{ color: textSecondary }}>
                    {edu.year && <span>{edu.year}</span>}
                    {edu.cgpa && <span className="ml-2">· {edu.cgpa}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Experience ── */}
      {hasExperience && (
        <>
          <SectionHeading title="Experience" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.itemGap }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[11px]">
                      {exp.role || <EmptyField text="Role" />}
                    </span>
                    {exp.company && (
                      <span style={{ color: textSecondary }}> · {exp.company}</span>
                    )}
                  </div>
                  {exp.duration && (
                    <span className="flex-shrink-0 text-[10px]" style={{ color: textSecondary }}>
                      {exp.duration}
                    </span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 pl-3 flex flex-col" style={{ gap: density.bulletGap }}>
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                          <span className="flex-shrink-0 mt-0.5">•</span>
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

      {/* ── Projects ── */}
      {hasProjects && (
        <>
          <SectionHeading title="Projects" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.itemGap }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[11px]">
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                  {proj.techStack.length > 0 && (
                    <span className="text-[10px] flex-shrink-0" style={{ color: textTech }}>
                      {proj.techStack.join(", ")}
                    </span>
                  )}
                </div>
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 pl-3 flex flex-col" style={{ gap: density.bulletGap }}>
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                          <span className="flex-shrink-0 mt-0.5">•</span>
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

      {/* ── Skills ── */}
      {hasSkills && (
        <>
          <SectionHeading title="Skills" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.skillGap }}>
            {skills.technical.length > 0 && (
              <div className="flex gap-1.5">
                <span className="font-semibold flex-shrink-0">Technical:</span>
                <span style={{ color: textBody }}>
                  {skills.technical.join(", ")}
                </span>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div className="flex gap-1.5">
                <span className="font-semibold flex-shrink-0">Tools:</span>
                <span style={{ color: textBody }}>
                  {skills.tools.join(", ")}
                </span>
              </div>
            )}
            {skills.languages.length > 0 && (
              <div className="flex gap-1.5">
                <span className="font-semibold flex-shrink-0">Languages:</span>
                <span style={{ color: textBody }}>
                  {skills.languages.join(", ")}
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty state */}
      {!personal.name &&
        !hasEducation &&
        !hasExperience &&
        !hasSkills &&
        !hasProjects && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p
              className="text-[#cbd5e1] text-sm"
              style={{ fontFamily: bodyFontStack }}
            >
              Start filling the form —
              <br />
              your resume will appear here.
            </p>
          </div>
        )}
    </div>
  );
}
