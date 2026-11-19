// src/components/templates/ExecutiveTemplate.jsx

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
    "padding": "28px 32px",
    "sectionGap": "14px",
    "itemGap": "10px",
    "educationGap": "8px",
    "bulletGap": "1px",
    "skillGap": "4px",
    "columnGap": "12px"
  },
  "balanced": {
    "lineHeight": "1.55",
    "padding": "36px 40px",
    "sectionGap": "20px",
    "itemGap": "14px",
    "educationGap": "10px",
    "bulletGap": "2px",
    "skillGap": "6px",
    "columnGap": "16px"
  },
  "spacious": {
    "lineHeight": "1.75",
    "padding": "44px 48px",
    "sectionGap": "26px",
    "itemGap": "20px",
    "educationGap": "16px",
    "bulletGap": "4px",
    "skillGap": "8px",
    "columnGap": "20px"
  }
};

function SectionHeading({ title, accentColor, dividerColor, headingColor, headingFontStack, headingStyle, dividerStyle, density }) {
  return (
    <div className="flex items-center gap-2 mb-2" style={{ marginTop: density.sectionGap }}>
      <span className="text-[11px] font-semibold tracking-[0.08em] whitespace-nowrap" style={{ fontFamily: headingFontStack, color: headingColor, textTransform: headingStyle === "uppercase" ? "uppercase" : "none" }}>
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

export default function ExecutiveTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  // Missing-value exceptions preserve this template's original palette and
  // typography. Explicit theme choices take precedence over these defaults.
  const theme = resume.theme || {};
  const accentColor = theme.accentColor || "#4a6fa5";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#0a1628";
  const headingColor = theme.headingColor || textColor;
  const linkColor = theme.linkColor || accentColor;
  const headingFontStack = getFontStack(theme.fontFamily || "georgia");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const headingStyle = theme.headingStyle || "uppercase";
  // Section rules follow dividerStyle; the formal header border stays structural.
  const dividerStyle = theme.dividerStyle || "line";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const textBody = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.15) : "#1e3a5f";
  const textSecondary = theme.textColor ? blendTowardBase(textColor, backgroundColor, 0.35) : "#4a6fa5";
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
      {/* ── Header: serif name, centered, formal double-rule ── */}
      <div className="text-center mb-4 pb-3" style={{ borderBottom: "2px solid " + headingColor }}>
        <h1
          className="text-[26px] tracking-tight" style={{ fontFamily: headingFontStack, color: headingColor }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-2 text-[10px] tracking-wide" style={{ color: textBody }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>|</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>|</span>}
          {personal.address && <span>{personal.address}</span>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>

        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap justify-center gap-x-3 mt-1 text-[10px]" style={{ color: linkColor }}>
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* ── Education (leads — MBA/executive convention) ── */}
      {hasEducation && (
        <>
          <SectionHeading title="Education" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.educationGap }}>
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-semibold text-[12px]"
                      style={{ fontFamily: headingFontStack, color: headingColor }}
                    >
                      {edu.degree || <EmptyField text="Degree" />}
                    </span>
                    {edu.college && (
                      <div className="text-[10.5px]" style={{ color: textBody }}>{edu.college}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 text-[10px]" style={{ color: textSecondary }}>
                    {edu.year && <span>{edu.year}</span>}
                    {edu.cgpa && <div className="mt-0.5">{edu.cgpa}</div>}
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
          <SectionHeading title="Professional Experience" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.itemGap }}>
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-semibold text-[12px]"
                      style={{ fontFamily: headingFontStack, color: headingColor }}
                    >
                      {exp.company || <EmptyField text="Company" />}
                    </span>
                    {exp.role && (
                      <span className="text-[10.5px] italic" style={{ color: textBody }}> — {exp.role}</span>
                    )}
                  </div>
                  {exp.duration && (
                    <span className="flex-shrink-0 text-[10px]" style={{ color: textSecondary }}>
                      {exp.duration}
                    </span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 flex flex-col pl-4" style={{ gap: density.bulletGap }}>
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} style={{ listStyleType: "disc", color: textBody }}>
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
          <SectionHeading title="Key Projects" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.itemGap }}>
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="font-semibold text-[11.5px]"
                    style={{ fontFamily: headingFontStack, color: headingColor }}
                  >
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                  {proj.techStack.length > 0 && (
                    <span className="text-[10px] italic flex-shrink-0" style={{ color: textSecondary }}>
                      {proj.techStack.join(", ")}
                    </span>
                  )}
                </div>
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 flex flex-col pl-4" style={{ gap: density.bulletGap }}>
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} style={{ listStyleType: "disc", color: textBody }}>
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

      {/* ── Skills ── */}
      {hasSkills && (
        <>
          <SectionHeading title="Core Competencies" {...sectionTheme} />
          <div className="flex flex-col" style={{ gap: density.educationGap }}>
            {skills.technical.length > 0 && (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0 text-[10.5px]">Technical:</span>
                <span className="text-[10.5px]" style={{ color: textBody }}>
                  {skills.technical.join(" · ")}
                </span>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0 text-[10.5px]">Tools:</span>
                <span className="text-[10.5px]" style={{ color: textBody }}>
                  {skills.tools.join(" · ")}
                </span>
              </div>
            )}
            {skills.languages.length > 0 && (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0 text-[10.5px]">Languages:</span>
                <span className="text-[10.5px]" style={{ color: textBody }}>
                  {skills.languages.join(" · ")}
                </span>
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