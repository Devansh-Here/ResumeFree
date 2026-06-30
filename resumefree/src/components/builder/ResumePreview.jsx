// src/components/builder/ResumePreview.jsx
import { useResumeStore } from "../../store/resumeStore";

// ── Section Divider ───────────────────────────────────────────
function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <span
        className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#0a1628]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </span>
      <div className="flex-1 h-px bg-[#0a1628]" />
    </div>
  );
}

// ── Empty placeholder ─────────────────────────────────────────
function EmptyField({ text }) {
  return (
    <span className="text-[#cbd5e1] italic">{text}</span>
  );
}

export default function ResumePreview() {
  const { resume } = useResumeStore();
  const { personal, education, experience, skills, projects } = resume;

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 ||
    skills.tools.length > 0 ||
    skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  return (
    <div
      className="bg-white shadow-md rounded-sm w-full"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        lineHeight: "1.5",
        color: "#0a1628",
        padding: "32px 36px",
        minHeight: "842px",
      }}
    >
      {/* ── Header ── */}
      <div className="text-center mb-3">
        <h1
          className="font-bold text-[22px] tracking-tight text-[#0a1628]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>

        {/* Contact line */}
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-1 text-[10px] text-[#1e3a5f]">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>· {personal.phone}</span>}
          {personal.address && <span>· {personal.address}</span>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>

        {/* Links line */}
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap justify-center gap-x-3 mt-0.5 text-[10px] text-[#059669]">
            {personal.linkedin && (
              <span>linkedin.com/in/{personal.linkedin}</span>
            )}
            {personal.github && (
              <span>github.com/{personal.github}</span>
            )}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* ── Education ── */}
      {hasEducation && (
        <>
          <SectionHeading title="Education" />
          <div className="space-y-2.5">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[11px]">
                      {edu.degree || <EmptyField text="Degree" />}
                    </span>
                    {edu.college && (
                      <span className="text-[#1e3a5f]/70"> · {edu.college}</span>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 text-[#1e3a5f]/70">
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
          <SectionHeading title="Experience" />
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[11px]">
                      {exp.role || <EmptyField text="Role" />}
                    </span>
                    {exp.company && (
                      <span className="text-[#1e3a5f]/70"> · {exp.company}</span>
                    )}
                  </div>
                  {exp.duration && (
                    <span className="text-[#1e3a5f]/70 flex-shrink-0 text-[10px]">
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
          <SectionHeading title="Projects" />
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[11px]">
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                  {proj.techStack.length > 0 && (
                    <span className="text-[#4a6fa5] text-[10px] flex-shrink-0">
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
          <SectionHeading title="Skills" />
          <div className="space-y-1">
            {skills.technical.length > 0 && (
              <div className="flex gap-1.5">
                <span className="font-semibold flex-shrink-0">Technical:</span>
                <span className="text-[#1e3a5f]">
                  {skills.technical.join(", ")}
                </span>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div className="flex gap-1.5">
                <span className="font-semibold flex-shrink-0">Tools:</span>
                <span className="text-[#1e3a5f]">
                  {skills.tools.join(", ")}
                </span>
              </div>
            )}
            {skills.languages.length > 0 && (
              <div className="flex gap-1.5">
                <span className="font-semibold flex-shrink-0">Languages:</span>
                <span className="text-[#1e3a5f]">
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
              style={{ fontFamily: "'Inter', sans-serif" }}
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