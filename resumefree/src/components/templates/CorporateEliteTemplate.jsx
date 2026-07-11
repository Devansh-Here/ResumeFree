// src/components/templates/CorporateEliteTemplate.jsx

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
// the picked accent color is.
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

function SectionHeading({ title, dark, accentColor }) {
  return (
    <div className="mt-4 mb-2">
      <div className="flex items-center gap-1.5">
        {/* NEW — small accent dot marker. Purely decorative (no text sits
            on it), so it's always safe to color directly with accentColor
            even if the user picks something very light. Gives section
            headings more visible "theme" weight beyond just the underline. */}
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: accentColor }}
        />
        <span
          className={`text-[10px] font-bold tracking-[0.15em] uppercase ${
            dark ? "text-white/90" : "text-[#0a1628]"
          }`}
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {title}
        </span>
      </div>
      <div
        className="h-[2px] w-8 mt-1 ml-3"
        style={{ backgroundColor: accentColor }}
      />
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function CorporateEliteTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  // NEW — accent color + photo, both fall back safely for resumes saved
  // before Section 5o (theme/photo fields added via resumeStore's merge()).
  const accentColor = resume.theme?.accentColor || "#059669";
  const photoUrl = personal.photo?.processedDataUrl || null;
  const nameInitial = personal.name?.trim()?.[0]?.toUpperCase() || "?";

  // NEW — the sidebar background is no longer hardcoded navy. It's now a
  // blend of the user's chosen accentColor with the original ink navy,
  // weighted heavily toward navy (70%) so it always stays dark enough for
  // white text to read clearly — but the tint is now clearly visible,
  // making a picked accent color feel like it changes the WHOLE resume's
  // theme, not just a couple of thin underlines.
  const sidebarBg = blendTowardBase(accentColor, "#0a1628", 0.7);
  // Skill tag chips in the sidebar: accent-tinted instead of plain white
  // overlay, so they visibly shift with the chosen theme too.
  const chipBg = accentAlpha(accentColor, 0.22);

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
      className="bg-white shadow-md rounded-sm w-full overflow-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        lineHeight: "1.5",
        minHeight: "842px",
      }}
    >
      {/* NEW — thin full-width accent strip at the very top. Purely
          decorative (no text sits on it), so always safe regardless of how
          light the chosen accent color is. Gives an immediate, unmissable
          "yes, the theme actually changed" signal at a glance. */}
      <div className="h-[5px] w-full" style={{ backgroundColor: accentColor }} />

      <div className="flex" style={{ minHeight: "837px" }}>
        {/* ── Sidebar ── */}
        <div
          className="flex-shrink-0"
          style={{ width: "34%", backgroundColor: sidebarBg, color: "white", padding: "30px 22px" }}
        >
          {/* Photo slot. Shows uploaded+processed photo if present,
              otherwise a neutral initial-letter placeholder so the layout
              stays consistent whether or not the user has added a photo. */}
          <div
            className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center mb-3 flex-shrink-0"
            style={{
              backgroundColor: photoUrl ? "transparent" : "rgba(255,255,255,0.08)",
              border: `2px solid ${accentColor}`,
            }}
          >
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={personal.name || "Profile photo"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span
                className="text-[20px] text-white/70"
                style={{ fontFamily: "'DM Serif Display', serif" }}
              >
                {nameInitial}
              </span>
            )}
          </div>

          <h1
            className="text-[26px] leading-tight text-white mb-1"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {personal.name || <EmptyField text="Your Name" />}
          </h1>
          {/* Widened from w-8 to w-12 — a bit more visual weight now that
              the sidebar itself carries the accent tint too. */}
          <div className="h-[2px] w-12 mb-4" style={{ backgroundColor: accentColor }} />

          <div className="space-y-1 text-[10px] text-[#cbd5e1]">
            {personal.email && <div>{personal.email}</div>}
            {personal.phone && <div>{personal.phone}</div>}
            {personal.address && <div>{personal.address}</div>}
            {!personal.email && !personal.phone && !personal.address && (
              <EmptyField text="email · phone · city" />
            )}
          </div>

          {(personal.linkedin || personal.github || personal.portfolio) && (
            <div className="space-y-1 mt-2 text-[10px]" style={{ color: "#6ee7b7" }}>
              {personal.linkedin && <div>linkedin.com/in/{personal.linkedin}</div>}
              {personal.github && <div>github.com/{personal.github}</div>}
              {personal.portfolio && <div>{personal.portfolio}</div>}
            </div>
          )}

          {hasSkills && (
            <>
              <SectionHeading title="Skills" dark accentColor={accentColor} />
              <div className="flex flex-wrap gap-1.5">
                {allSkills.map((s, i) => (
                  <span
                    key={i}
                    className="text-[9px] px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: chipBg, color: "#e2e8f0" }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </>
          )}

          {hasEducation && (
            <>
              <SectionHeading title="Education" dark accentColor={accentColor} />
              <div className="space-y-2.5">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-[10.5px] text-white">
                      {edu.degree || <EmptyField text="Degree" />}
                    </div>
                    {edu.college && (
                      <div className="text-[10px] text-[#cbd5e1]">{edu.college}</div>
                    )}
                    <div className="text-[9.5px] text-[#94a3b8] mt-0.5">
                      {edu.year}
                      {edu.cgpa && <span> · {edu.cgpa}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Main ── */}
        <div className="flex-1" style={{ padding: "30px 28px", color: "#0a1628" }}>
          {hasExperience && (
            <>
              <SectionHeading title="Experience" accentColor={accentColor} />
              <div className="space-y-3">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="font-semibold text-[11.5px]">
                          {exp.role || <EmptyField text="Role" />}
                        </span>
                        {exp.company && (
                          <span className="text-[#4a6fa5]"> · {exp.company}</span>
                        )}
                      </div>
                      {exp.duration && (
                        <span className="text-[#4a6fa5] flex-shrink-0 text-[10px]">
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    {exp.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-1 space-y-0.5 pl-3">
                        {exp.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1.5 text-[#1e3a5f]">
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
              <SectionHeading title="Projects" accentColor={accentColor} />
              <div className="space-y-3">
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
                            <li key={i} className="flex gap-1.5 text-[#1e3a5f]">
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