// src/components/templates/CompactTemplate.jsx

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
    "lineHeight": "1.2",
    "padding": "18px 22px",
    "sectionGap": "8px",
    "itemGap": "6px",
    "educationGap": "4px",
    "bulletGap": "1px",
    "skillGap": "4px",
    "columnGap": "12px"
  },
  "balanced": {
    "lineHeight": "1.35",
    "padding": "24px 28px",
    "sectionGap": "12px",
    "itemGap": "8px",
    "educationGap": "6px",
    "bulletGap": "2px",
    "skillGap": "6px",
    "columnGap": "16px"
  },
  "spacious": {
    "lineHeight": "1.5",
    "padding": "32px 36px",
    "sectionGap": "16px",
    "itemGap": "12px",
    "educationGap": "10px",
    "bulletGap": "4px",
    "skillGap": "8px",
    "columnGap": "20px"
  }
};

function SectionHeading({ title, accentColor, dividerColor, headingColor, headingFontStack, headingStyle, dividerStyle, density }) {
  return (
    <div className="flex items-center gap-2 mb-1.5" style={{ marginTop: density.sectionGap }}>
      <span className="text-[9px] font-bold tracking-[0.12em]" style={{ fontFamily: headingFontStack, color: headingColor, textTransform: headingStyle === "uppercase" ? "uppercase" : "none" }}>
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

export default function CompactTemplate({ resume }) {
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
  // Minimal/Compact originally had no section rules; structural borders remain.
  const dividerStyle = theme.dividerStyle || "none";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const textBody = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.15) : "#1e3a5f";
  const textSecondary = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.35) : "#4a6fa5";
  const textMuted = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.5) : "#cbd5e1";
  const dividerColor = theme.accentColor ? accentAlpha(accentColor, 0.35) : "#cbd5e1";
  const chipBg = theme.accentColor || theme.backgroundColor ? blendTowardBase(accentColor, backgroundColor, 0.92) : "#ecfdf5";
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
        fontSize: "10px",
        lineHeight: density.lineHeight,
        color: textColor,
        padding: density.padding,
        minHeight: "842px",
      }}
    >
      {/* ── Header: name + contact on same row (space-saving) ── */}
      <div className="flex items-start justify-between gap-3 pb-2 mb-2 border-b" style={{ borderColor: dividerColor }}>
        <div>
          <h1
            className="font-bold text-[18px] tracking-tight leading-none" style={{ fontFamily: headingFontStack, color: headingColor }}
          >
            {personal.name || <EmptyField text="Your Name" />}
          </h1>
          {(personal.linkedin || personal.github || personal.portfolio) && (
            <div className="flex flex-wrap gap-x-2 mt-1 text-[9px] font-medium" style={{ color: linkColor }}>
              {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
              {personal.github && <span>github.com/{personal.github}</span>}
              {personal.portfolio && <span>{personal.portfolio}</span>}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 text-[9px] leading-[1.5]" style={{ color: textBody }}>
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.address && <div>{personal.address}</div>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>
      </div>

      {/* ── Two-column body: main (left, wider) + skills/education (right, narrow) ── */}
      <div className="flex" style={{ gap: density.columnGap }}>
        {/* Left column: Experience + Projects */}
        <div className="flex-[2.2] min-w-0">
          {hasExperience && (
            <>
              <SectionHeading title="Experience" {...sectionTheme} />
              <div className="flex flex-col" style={{ gap: density.itemGap }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[10.5px]">
                        {exp.role || <EmptyField text="Role" />}
                        {exp.company && (
                          <span className="font-normal" style={{ color: textSecondary }}> · {exp.company}</span>
                        )}
                      </span>
                      {exp.duration && (
                        <span className="flex-shrink-0 text-[9px]" style={{ color: textSecondary }}>
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    {exp.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-0.5 flex flex-col" style={{ gap: density.bulletGap }}>
                        {exp.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1" style={{ color: textBody }}>
                              <span className="flex-shrink-0" style={{ color: accentColor }}>–</span>
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
              <div className="flex flex-col" style={{ gap: density.itemGap }}>
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[10.5px]">
                        {proj.name || <EmptyField text="Project Name" />}
                      </span>
                      {proj.techStack.length > 0 && (
                        <span className="text-[9px] flex-shrink-0" style={{ color: textSecondary }}>
                          {proj.techStack.join(", ")}
                        </span>
                      )}
                    </div>
                    {proj.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-0.5 flex flex-col" style={{ gap: density.bulletGap }}>
                        {proj.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1" style={{ color: textBody }}>
                              <span className="flex-shrink-0" style={{ color: accentColor }}>–</span>
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
        </div>

        {/* Right column: Education + Skills */}
        <div className="flex-1 min-w-0 border-l pl-3" style={{ borderColor: dividerColor }}>
          {hasEducation && (
            <>
              <SectionHeading title="Education" {...sectionTheme} />
              <div className="flex flex-col" style={{ gap: density.educationGap }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-[10px]">
                      {edu.degree || <EmptyField text="Degree" />}
                    </div>
                    {edu.college && (
                      <div className="text-[9px]" style={{ color: textSecondary }}>{edu.college}</div>
                    )}
                    <div className="text-[9px]" style={{ color: textMuted }}>
                      {edu.year && <span>{edu.year}</span>}
                      {edu.cgpa && <span className="ml-1">· {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {hasSkills && (
            <>
              <SectionHeading title="Skills" {...sectionTheme} />
              <div className="flex flex-col" style={{ gap: density.educationGap }}>
                {skills.technical.length > 0 && (
                  <div>
                    <div className="text-[9px] font-medium mb-0.5" style={{ color: textSecondary }}>Technical</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.technical.map((s, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[8.5px] font-medium" style={{ color: accentColor, backgroundColor: chipBg }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.tools.length > 0 && (
                  <div>
                    <div className="text-[9px] font-medium mb-0.5" style={{ color: textSecondary }}>Tools</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.tools.map((s, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded text-[8.5px] font-medium" style={{ color: accentColor, backgroundColor: chipBg }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.languages.length > 0 && (
                  <div>
                    <div className="text-[9px] font-medium mb-0.5" style={{ color: textSecondary }}>Languages</div>
                    <div className="text-[9px]" style={{ color: textBody }}>
                      {skills.languages.join(", ")}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

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