// src/components/templates/TechnicalProTemplate.jsx

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
    "lineHeight": "1.35",
    "padding": "22px 26px",
    "sectionGap": "10px",
    "itemGap": "8px",
    "educationGap": "6px",
    "bulletGap": "1px",
    "skillGap": "4px",
    "columnGap": "12px"
  },
  "balanced": {
    "lineHeight": "1.5",
    "padding": "30px 34px",
    "sectionGap": "16px",
    "itemGap": "12px",
    "educationGap": "10px",
    "bulletGap": "2px",
    "skillGap": "6px",
    "columnGap": "16px"
  },
  "spacious": {
    "lineHeight": "1.7",
    "padding": "38px 42px",
    "sectionGap": "22px",
    "itemGap": "18px",
    "educationGap": "16px",
    "bulletGap": "4px",
    "skillGap": "8px",
    "columnGap": "20px"
  }
};

function SectionHeading({ title, accentColor, headingColor, headingFontStack, headingStyle, dividerStyle, density }) {
  return (
    <div className="flex items-center gap-2 mb-2" style={{ marginTop: density.sectionGap }}>
      {dividerStyle === "line" && (<span aria-hidden="true" className="text-[11px]" style={{ color: accentColor }}>{"//"}</span>)}
      <span className="text-[10.5px] font-bold tracking-[0.1em]" style={{ fontFamily: headingFontStack, color: headingColor, textTransform: headingStyle === "uppercase" ? "uppercase" : "none" }}>
        {title}
      </span>
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

function SkillCol({ label, items, surfaceColor, dividerColor, textSecondary, chipBg, chipText, density }) {
  if (!items.length) return null;
  return (
    <div
      className="flex-1 rounded-lg p-2.5"
      style={{ backgroundColor: surfaceColor, border: "1px solid " + dividerColor }}
    >
      <div className="text-[9px] font-bold uppercase tracking-wider mb-1" style={{ color: textSecondary }}>
        {label}
      </div>
      <div className="flex flex-wrap" style={{ gap: density.skillGap }}>
        {items.map((s, i) => (
          <span
            key={i}
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: chipBg, color: chipText }}
          >
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TechnicalProTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  // Missing-value exceptions preserve this template's original palette and
  // typography. Explicit theme choices take precedence over these defaults.
  const theme = resume.theme || {};
  const accentColor = theme.accentColor || "#059669";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#0a1628";
  const headingColor = theme.headingColor || textColor;
  const linkColor = theme.linkColor || accentColor;
  const headingFontStack = getFontStack(theme.fontFamily || "arial");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const headingStyle = theme.headingStyle || "uppercase";
  // The line divider retains Technical Pro's slash marker; structural borders remain.
  const dividerStyle = theme.dividerStyle || "line";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const textBody = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.15) : "#1e3a5f";
  const textSecondary = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.35) : "#4a6fa5";
  const dividerColor = theme.accentColor ? accentAlpha(accentColor, 0.35) : "#cbd5e1";
  const surfaceColor = theme.backgroundColor || theme.accentColor ? blendTowardBase(accentColor, backgroundColor, 0.96) : "#f8fafc";
  // Preserve the dark chips by default; custom ink uses a light tinted chip.
  const chipBg = theme.textColor ? blendTowardBase(accentColor, backgroundColor, 0.9) : blendTowardBase(accentColor, "#0a1628", 0.85);
  const chipText = theme.textColor || "#d1fae5";
  const skillTheme = { surfaceColor, dividerColor, textSecondary, chipBg, chipText, density };
  const sectionTheme = { accentColor, dividerColor, headingColor, headingFontStack, headingStyle, dividerStyle, density };

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  return (
    <div
      className="shadow-md rounded-sm w-full"
      style={{ fontFamily: bodyFontStack, backgroundColor, color: textColor,  fontSize: "11px", lineHeight: density.lineHeight, padding: density.padding, minHeight: "842px" }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 pb-3" style={{ borderBottom: "1px solid " + dividerColor }}>
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ fontFamily: headingFontStack, color: headingColor }}>
            {personal.name || <EmptyField text="Your Name" />}
          </h1>
          <div className="flex flex-wrap gap-x-3 mt-1 text-[10px]" style={{ color: textSecondary }}>
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.address && <span>{personal.address}</span>}
          </div>
          {(personal.linkedin || personal.github || personal.portfolio) && (
            <div className="flex flex-wrap gap-x-3 mt-0.5 text-[10px]" style={{ color: linkColor }}>
              {personal.github && <span>github.com/{personal.github}</span>}
              {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
              {personal.portfolio && <span>{personal.portfolio}</span>}
            </div>
          )}
        </div>
      </div>

      {hasSkills && (
        <>
          <SectionHeading title="Stack" {...sectionTheme} />
          <div className="flex gap-2">
            <SkillCol label="Technical" items={skills.technical} {...skillTheme} />
            <SkillCol label="Tools" items={skills.tools} {...skillTheme} />
            <SkillCol label="Languages" items={skills.languages} {...skillTheme} />
          </div>
        </>
      )}

      {hasExperience && (
        <>
          <SectionHeading title="Experience" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.itemGap }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[11.5px]" style={{ color: textColor }}>
                    {exp.role || <EmptyField text="Role" />}
                    {exp.company && <span className="font-normal" style={{ color: textSecondary }}> · {exp.company}</span>}
                  </span>
                  {exp.duration && (
                    <span className="text-[10px] flex-shrink-0" style={{ color: textSecondary }}>{exp.duration}</span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 flex flex-col pl-3" style={{ gap: density.bulletGap }}>
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                          <span className="flex-shrink-0" style={{ color: accentColor }}>▸</span>
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
          <SectionHeading title="Projects" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.educationGap }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[11px]" style={{ color: textColor }}>
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                </div>
                {proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.techStack.map((t, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: surfaceColor, border: "1px solid " + dividerColor, color: textBody }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 flex flex-col pl-3" style={{ gap: density.bulletGap }}>
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                          <span className="flex-shrink-0" style={{ color: accentColor }}>▸</span>
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
          <SectionHeading title="Education" {...sectionTheme} />
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {education.map((edu) => (
              <div key={edu.id} className="text-[10.5px]">
                <span className="font-semibold" style={{ color: textColor }}>{edu.degree || <EmptyField text="Degree" />}</span>
                <span style={{ color: textSecondary }}> · {edu.college} {edu.year && `· ${edu.year}`} {edu.cgpa && `· ${edu.cgpa}`}</span>
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
  );
}