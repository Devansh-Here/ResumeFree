// src/components/templates/CreativeEdgeTemplate.jsx
import { getFontStack } from "../../utils/fontOptions";

// ── Theme-derived color helpers (same pattern as CorporateEliteTemplate.jsx / StartupBoldTemplate.jsx) ──
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
    padding: "26px 30px",
    headerGap: "12px",
    timelineGap: "10px",
    sectionGap: "12px",
    footerGap: "24px",
  },
  balanced: {
    lineHeight: "1.5",
    padding: "34px 38px",
    headerGap: "16px",
    timelineGap: "16px",
    sectionGap: "16px",
    footerGap: "32px",
  },
  spacious: {
    lineHeight: "1.65",
    padding: "42px 46px",
    headerGap: "20px",
    timelineGap: "22px",
    sectionGap: "22px",
    footerGap: "40px",
  },
};

function SectionHeading({ title, accentColor, headingColor, headingFontStack, uppercase, divider }) {
  return (
    <div className="mt-4 mb-2.5">
      <span
        className={`text-[11px] font-bold ${uppercase ? "uppercase" : ""} tracking-[0.12em]`}
        style={{ color: accentColor, fontFamily: headingFontStack }}
      >
        {title}
      </span>
      {divider === "line" && (
        <div className="h-px mt-1.5 w-8" style={{ backgroundColor: accentAlpha(accentColor, 0.35) }} />
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
      {/* headingColor is intentionally unused on this specific heading — CreativeEdge's
          section-title color IS the accent color by design (that's this template's
          visual identity). headingColor still applies to item-level headings below
          (role, project name, degree) per the same "primary content heading" convention
          used across the other templates. */}
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function CreativeEdgeTemplate({ resume }) {
  const { personal, education, experience, skills, projects, theme = {} } = resume;

  // ── Resolve theme fields (safe fallbacks matching resumeStore.js DEFAULT_RESUME.theme) ──
  const accentColor = theme.accentColor || "#7451f2";
  const backgroundColor = theme.backgroundColor || "#ffffff";
  const textColor = theme.textColor || "#272727";
  const headingColor = theme.headingColor || textColor;
  const linkColor = theme.linkColor || accentColor;
  const headingFontStack = getFontStack(theme.fontFamily || "georgia");
  const bodyFontStack = getFontStack(theme.bodyFontFamily || "arial");
  const uppercaseHeadings = theme.headingStyle === "uppercase";
  const density = DENSITY_SCALE[theme.density] || DENSITY_SCALE.balanced;
  const dividerStyle = theme.dividerStyle || "line";

  const textSecondary = blendTowardBase(textColor, "#ffffff", 0.4); // meta labels (duration, year, address block)
  const textBody = blendTowardBase(textColor, "#ffffff", 0.15); // bullet body text
  const dividerLine = blendTowardBase(textColor, "#ffffff", 0.75); // header hairline + right-block left border base

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;
  const allSkills = [...skills.technical, ...skills.tools, ...skills.languages];

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
        className="flex items-start justify-between gap-6 pb-4"
        style={{ borderBottom: `2px solid ${headingColor}`, marginBottom: density.headerGap }}
      >
        <h1
          className="text-[30px] leading-none"
          style={{ fontFamily: headingFontStack, color: headingColor }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>
        <div
          className="text-right text-[10px] flex-shrink-0 pl-4"
          style={{ borderLeft: `2px solid ${accentAlpha(accentColor, 0.2)}`, color: textSecondary }}
        >
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.address && <div>{personal.address}</div>}
          {personal.linkedin && <div style={{ color: linkColor }}>linkedin.com/in/{personal.linkedin}</div>}
          {personal.github && <div style={{ color: linkColor }}>github.com/{personal.github}</div>}
          {personal.portfolio && <div style={{ color: linkColor }}>{personal.portfolio}</div>}
        </div>
      </div>

      {hasExperience && (
        <>
          <SectionHeading
            title="Experience"
            accentColor={accentColor}
            headingColor={headingColor}
            headingFontStack={headingFontStack}
            uppercase={uppercaseHeadings}
            divider={dividerStyle}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: density.timelineGap }}>
            {experience.map((exp, idx) => (
              <div key={exp.id} className="relative pl-5">
                <span
                  className="absolute left-0 top-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: accentColor }}
                />
                {idx !== experience.length - 1 && (
                  <span
                    className="absolute left-[3px] top-3 bottom-[-16px] w-px"
                    style={{ backgroundColor: accentAlpha(accentColor, 0.25) }}
                  />
                )}
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
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} style={{ color: textBody }}>— {bullet}</li>
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
          />
          <div className="grid grid-cols-2 gap-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl p-3"
                style={{ backgroundColor: accentAlpha(accentColor, 0.08) }}
              >
                <span className="font-semibold text-[11px]" style={{ color: headingColor }}>
                  {proj.name || <EmptyField text="Project Name" />}
                </span>
                {proj.techStack.length > 0 && (
                  <div className="text-[9.5px] mt-0.5" style={{ color: blendTowardBase(accentColor, "#000000", 0.15) }}>
                    {proj.techStack.join(" · ")}
                  </div>
                )}
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[10.5px]" style={{ color: textBody }}>— {bullet}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-8" style={{ marginTop: density.footerGap }}>
        {hasEducation && (
          <div className="flex-1">
            <SectionHeading
              title="Education"
              accentColor={accentColor}
              headingColor={headingColor}
              headingFontStack={headingFontStack}
              uppercase={uppercaseHeadings}
              divider={dividerStyle}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: density.timelineGap }}>
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-semibold text-[11px]" style={{ color: headingColor }}>
                    {edu.degree || <EmptyField text="Degree" />}
                  </div>
                  <div className="text-[10px]" style={{ color: textSecondary }}>
                    {edu.college} {edu.year && <span>· {edu.year}</span>} {edu.cgpa && <span>· {edu.cgpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSkills && (
          <div className="flex-1">
            <SectionHeading
              title="Skills"
              accentColor={accentColor}
              headingColor={headingColor}
              headingFontStack={headingFontStack}
              uppercase={uppercaseHeadings}
              divider={dividerStyle}
            />
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s, i) => (
                <span
                  key={i}
                  className="text-[9.5px] px-2 py-0.5 rounded-full"
                  style={{
                    border: i % 2 === 0 ? `1px solid ${accentColor}` : `1px solid ${dividerLine}`,
                    color: i % 2 === 0 ? accentColor : textSecondary,
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
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