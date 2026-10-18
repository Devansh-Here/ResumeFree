// src/components/templates/GridProfessionalTemplate.jsx
import { getFontStack } from "../../utils/fontOptions";

// ── Theme-derived color helpers (same pattern as other propagated templates) ──
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

// ── Density scale ──
const DENSITY_SCALE = {
  compact: {
    lineHeight: "1.35",
    padding: "22px 28px",
    headerGap: "10px",
    colGap: "12px",
    cardPad: "10px",
    cardGap: "10px",
    itemGap: "8px",
  },
  balanced: {
    lineHeight: "1.5",
    padding: "30px 34px",
    headerGap: "16px",
    colGap: "16px",
    cardPad: "12px",
    cardGap: "12px",
    itemGap: "12px",
  },
  spacious: {
    lineHeight: "1.65",
    padding: "38px 42px",
    headerGap: "22px",
    colGap: "20px",
    cardPad: "16px",
    cardGap: "16px",
    itemGap: "16px",
  },
};

function SectionHeading({ title, accentColor, headingColor, headingFontStack, uppercase, divider }) {
  return (
    <div className="mb-2">
      <span
        className={`text-[10px] font-bold tracking-[0.15em] ${uppercase ? "uppercase" : ""}`}
        style={{ color: headingColor, fontFamily: headingFontStack }}
      >
        {title}
      </span>
      {divider === "line" && (
        <div className="h-px mt-1" style={{ backgroundColor: accentAlpha(accentColor, 0.3) }} />
      )}
      {divider === "dots" && (
        <div className="flex gap-1 mt-1.5">
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

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function GridProfessionalTemplate({ resume }) {
  const { personal, education, experience, skills, projects, theme = {} } = resume;

  // ── Resolve theme fields (safe fallbacks matching resumeStore.js DEFAULT_RESUME.theme) ──
  const accentColor = theme.accentColor || "#7451f2";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#272727";
  const headingColor = theme.headingColor || textColor;
  const linkColor = theme.linkColor || accentColor;
  const headingFontStack = getFontStack(theme.fontFamily || "georgia");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const uppercaseHeadings = theme.headingStyle !== "normal"; // this template's section labels were ALWAYS uppercase by design — see note below
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const dividerStyle = theme.dividerStyle || "line";

  const textSecondary = blendTowardBase(textColor, "#ffffff", 0.4); // meta labels (duration, year, address)
  const textBody = blendTowardBase(textColor, "#ffffff", 0.15); // bullet body text
  const cardBorder = blendTowardBase(textColor, "#ffffff", 0.78); // structural card/grid borders — NOT accent-tinted, purely a boundary

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  return (
    <div
      className="shadow-md rounded-sm w-full"
      style={{
        backgroundColor,
        fontFamily: bodyFontStack,
        fontSize: "11px",
        lineHeight: density.lineHeight,
        padding: density.padding,
        minHeight: "842px",
      }}
    >
      {/* ── Header ── */}
      <div
        className="text-center pb-3"
        style={{ borderBottom: `2px solid ${headingColor}`, marginBottom: density.headerGap }}
      >
        <h1 className="text-[22px] font-bold" style={{ fontFamily: headingFontStack, color: headingColor }}>
          {personal.name || <EmptyField text="Your Name" />}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 mt-1 text-[10px]" style={{ color: textSecondary }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>· {personal.phone}</span>}
          {personal.address && <span>· {personal.address}</span>}
        </div>
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap justify-center gap-x-3 mt-0.5 text-[10px]" style={{ color: linkColor }}>
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="flex" style={{ gap: density.colGap }}>
        {/* Left col */}
        <div className="flex-shrink-0" style={{ width: "30%" }}>
          {hasSkills && (
            <div
              className="rounded-lg"
              style={{ border: `1px solid ${cardBorder}`, padding: density.cardPad, marginBottom: density.cardGap }}
            >
              <SectionHeading
                title="Skills"
                accentColor={accentColor}
                headingColor={headingColor}
                headingFontStack={headingFontStack}
                uppercase={uppercaseHeadings}
                divider={dividerStyle}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                {skills.technical.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold uppercase" style={{ color: textSecondary }}>Technical</div>
                    <div className="text-[10px]" style={{ color: textBody }}>{skills.technical.join(", ")}</div>
                  </div>
                )}
                {skills.tools.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold uppercase" style={{ color: textSecondary }}>Tools</div>
                    <div className="text-[10px]" style={{ color: textBody }}>{skills.tools.join(", ")}</div>
                  </div>
                )}
                {skills.languages.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold uppercase" style={{ color: textSecondary }}>Languages</div>
                    <div className="text-[10px]" style={{ color: textBody }}>{skills.languages.join(", ")}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasEducation && (
            <div className="rounded-lg" style={{ border: `1px solid ${cardBorder}`, padding: density.cardPad }}>
              <SectionHeading
                title="Education"
                accentColor={accentColor}
                headingColor={headingColor}
                headingFontStack={headingFontStack}
                uppercase={uppercaseHeadings}
                divider={dividerStyle}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: density.itemGap }}>
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-[10.5px]" style={{ color: headingColor }}>
                      {edu.degree || <EmptyField text="Degree" />}
                    </div>
                    <div className="text-[10px]" style={{ color: textSecondary }}>{edu.college}</div>
                    <div className="text-[9.5px]" style={{ color: textSecondary, opacity: 0.8 }}>
                      {edu.year} {edu.cgpa && <span>· {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="flex-1">
          {hasExperience && (
            <div
              className="rounded-lg"
              style={{ border: `1px solid ${cardBorder}`, padding: density.cardPad, marginBottom: density.cardGap }}
            >
              <SectionHeading
                title="Experience"
                accentColor={accentColor}
                headingColor={headingColor}
                headingFontStack={headingFontStack}
                uppercase={uppercaseHeadings}
                divider={dividerStyle}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: density.itemGap }}>
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[11.5px]" style={{ color: headingColor }}>
                        {exp.role || <EmptyField text="Role" />}
                        {exp.company && <span className="font-normal" style={{ color: textSecondary }}> · {exp.company}</span>}
                      </span>
                      {exp.duration && (
                        <span className="text-[10px] flex-shrink-0" style={{ color: textSecondary }}>{exp.duration}</span>
                      )}
                    </div>
                    {exp.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-3">
                        {exp.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1.5" style={{ color: textBody }}>
                              <span className="flex-shrink-0 mt-0.5" style={{ color: accentColor }}>•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {hasProjects && (
            <div className="rounded-lg" style={{ border: `1px solid ${cardBorder}`, padding: density.cardPad }}>
              <SectionHeading
                title="Projects"
                accentColor={accentColor}
                headingColor={headingColor}
                headingFontStack={headingFontStack}
                uppercase={uppercaseHeadings}
                divider={dividerStyle}
              />
              <div style={{ display: "flex", flexDirection: "column", gap: density.itemGap }}>
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[11px]" style={{ color: headingColor }}>
                        {proj.name || <EmptyField text="Project Name" />}
                      </span>
                      {proj.techStack.length > 0 && (
                        <span className="text-[10px] flex-shrink-0" style={{ color: textSecondary }}>
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
                              <span className="flex-shrink-0 mt-0.5" style={{ color: accentColor }}>•</span>
                              <span>{bullet}</span>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

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