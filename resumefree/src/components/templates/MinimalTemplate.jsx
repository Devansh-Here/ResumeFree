// src/components/templates/MinimalTemplate.jsx

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

// Template-specific balanced spacing preserves the original layout.
const DENSITY_SCALE = {
  "compact": {
    "lineHeight": "1.45",
    "padding": "30px 34px",
    "sectionGap": "16px",
    "itemGap": "10px",
    "educationGap": "8px",
    "bulletGap": "2px",
    "skillGap": "4px",
    "columnGap": "12px"
  },
  "balanced": {
    "lineHeight": "1.7",
    "padding": "40px 44px",
    "sectionGap": "24px",
    "itemGap": "16px",
    "educationGap": "12px",
    "bulletGap": "4px",
    "skillGap": "6px",
    "columnGap": "16px"
  },
  "spacious": {
    "lineHeight": "1.85",
    "padding": "48px 52px",
    "sectionGap": "30px",
    "itemGap": "22px",
    "educationGap": "18px",
    "bulletGap": "6px",
    "skillGap": "8px",
    "columnGap": "20px"
  }
};

function SectionHeading({ title, accentColor, dividerColor, headingColor, headingFontStack, headingStyle, dividerStyle, density }) {
  return (
    <div className="flex items-center gap-2 mb-2.5" style={{ marginTop: density.sectionGap }}>
      <span className="text-[9px] font-medium tracking-[0.25em]" style={{ fontFamily: headingFontStack, color: headingColor, textTransform: headingStyle === "uppercase" ? "uppercase" : "none" }}>
        {title}
      </span>
      {dividerStyle === "line" && (<div aria-hidden="true" className="flex-1 h-px" style={{ backgroundColor: dividerColor }} />)}
      {dividerStyle === "dots" && (
        <div aria-hidden="true" className="flex gap-1">
          {[0, 1, 2].map((dot) => <span key={dot} className="w-1 h-1 rounded-full" style={{ backgroundColor: accentColor }} />)}
        </div>
      )}
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function MinimalTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  // Missing-value exceptions preserve this template's original palette and
  // typography. Explicit theme choices take precedence over these defaults.
  const theme = resume.theme || {};
  const accentColor = theme.accentColor || "#4a6fa5";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#0a1628";
  const headingColor = theme.headingColor || textColor;
  const linkColor = theme.linkColor || accentColor;
  const headingFontStack = getFontStack(theme.fontFamily || "arial");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const headingStyle = theme.headingStyle || "uppercase";
  // Minimal/Compact originally had no section rules; structural borders remain.
  const dividerStyle = theme.dividerStyle || "none";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const textBody = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.15) : "#1e3a5f";
  const textSecondary = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.35) : "#4a6fa5";
  const textMuted = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.5) : "#cbd5e1";
  const dividerColor = theme.accentColor ? accentAlpha(accentColor, 0.35) : "#cbd5e1";
  const sectionTheme = { accentColor, dividerColor, headingColor, headingFontStack, headingStyle, dividerStyle, density };

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
        fontFamily: bodyFontStack, backgroundColor,
        fontSize: "11px",
        lineHeight: density.lineHeight,
        color: textColor,
        padding: density.padding,
        minHeight: "842px",
      }}
    >
      {/* ── Header (left-aligned, no rule, lots of air) ── */}
      <div style={{ marginBottom: density.sectionGap }}>
        <h1
          className="font-light text-[26px] tracking-tight" style={{ fontFamily: headingFontStack, color: headingColor }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px]" style={{ color: textSecondary }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>

        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap gap-x-3 mt-1 text-[10px]" style={{ color: linkColor }}>
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
          <div className="flex flex-col" style={{ gap: density.itemGap }}>
            {education.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="font-medium text-[11px]">
                    {edu.degree || <EmptyField text="Degree" />}
                  </span>
                  {edu.college && (
                    <span style={{ color: textSecondary }}>, {edu.college}</span>
                  )}
                </div>
                <div className="text-right flex-shrink-0 text-[10px]" style={{ color: textMuted }}>
                  {edu.year && <span>{edu.year}</span>}
                  {edu.cgpa && <span className="ml-2">{edu.cgpa}</span>}
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
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-[11px]">
                    {exp.role || <EmptyField text="Role" />}
                    {exp.company && (
                      <span className="font-normal" style={{ color: textSecondary }}>
                        , {exp.company}
                      </span>
                    )}
                  </span>
                  {exp.duration && (
                    <span className="flex-shrink-0 text-[10px]" style={{ color: textMuted }}>
                      {exp.duration}
                    </span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1.5 flex flex-col pl-0" style={{ gap: density.bulletGap }}>
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="pl-3 border-l" style={{ color: textBody, borderColor: dividerColor }}>
                          {bullet}
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
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-[11px]">
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                  {proj.techStack.length > 0 && (
                    <span className="text-[10px] flex-shrink-0" style={{ color: textMuted }}>
                      {proj.techStack.join(" · ")}
                    </span>
                  )}
                </div>
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1.5 flex flex-col" style={{ gap: density.bulletGap }}>
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="pl-3 border-l" style={{ color: textBody, borderColor: dividerColor }}>
                          {bullet}
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Skills (plain text, comma separated — no boxes) ── */}
      {hasSkills && (
        <>
          <SectionHeading title="Skills" {...sectionTheme} />
          <div className="flex flex-col" style={{ color: textBody, gap: density.educationGap }}>
            {skills.technical.length > 0 && (
              <div>
                <span style={{ color: textSecondary }}>Technical — </span>
                {skills.technical.join(", ")}
              </div>
            )}
            {skills.tools.length > 0 && (
              <div>
                <span style={{ color: textSecondary }}>Tools — </span>
                {skills.tools.join(", ")}
              </div>
            )}
            {skills.languages.length > 0 && (
              <div>
                <span style={{ color: textSecondary }}>Languages — </span>
                {skills.languages.join(", ")}
              </div>
            )}
          </div>
        </>
      )}

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