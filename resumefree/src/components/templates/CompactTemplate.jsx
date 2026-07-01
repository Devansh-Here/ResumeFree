// src/components/templates/CompactTemplate.jsx

// ── Section Heading (small caps, tight) ─────────────────────────
function SectionHeading({ title }) {
  return (
    <div className="mt-3 mb-1.5">
      <span
        className="text-[9px] font-bold tracking-[0.12em] uppercase text-[#059669]"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </span>
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function CompactTemplate({ resume }) {
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
        fontSize: "10px",
        lineHeight: "1.35",
        color: "#0a1628",
        padding: "24px 28px",
        minHeight: "842px",
      }}
    >
      {/* ── Header: name + contact on same row (space-saving) ── */}
      <div className="flex items-start justify-between gap-3 pb-2 mb-2 border-b border-[#cbd5e1]">
        <div>
          <h1
            className="font-bold text-[18px] tracking-tight text-[#0a1628] leading-none"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {personal.name || <EmptyField text="Your Name" />}
          </h1>
          {(personal.linkedin || personal.github || personal.portfolio) && (
            <div className="flex flex-wrap gap-x-2 mt-1 text-[9px] text-[#059669] font-medium">
              {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
              {personal.github && <span>github.com/{personal.github}</span>}
              {personal.portfolio && <span>{personal.portfolio}</span>}
            </div>
          )}
        </div>
        <div className="text-right flex-shrink-0 text-[9px] text-[#1e3a5f] leading-[1.5]">
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.address && <div>{personal.address}</div>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>
      </div>

      {/* ── Two-column body: main (left, wider) + skills/education (right, narrow) ── */}
      <div className="flex gap-4">
        {/* Left column: Experience + Projects */}
        <div className="flex-[2.2] min-w-0">
          {hasExperience && (
            <>
              <SectionHeading title="Experience" />
              <div className="space-y-2">
                {experience.map((exp) => (
                  <div key={exp.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[10.5px]">
                        {exp.role || <EmptyField text="Role" />}
                        {exp.company && (
                          <span className="text-[#4a6fa5] font-normal"> · {exp.company}</span>
                        )}
                      </span>
                      {exp.duration && (
                        <span className="text-[#4a6fa5] flex-shrink-0 text-[9px]">
                          {exp.duration}
                        </span>
                      )}
                    </div>
                    {exp.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-0.5 space-y-0.5">
                        {exp.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1 text-[#1e3a5f]">
                              <span className="flex-shrink-0 text-[#059669]">–</span>
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
              <SectionHeading title="Projects" />
              <div className="space-y-2">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-semibold text-[10.5px]">
                        {proj.name || <EmptyField text="Project Name" />}
                      </span>
                      {proj.techStack.length > 0 && (
                        <span className="text-[#4a6fa5] text-[9px] flex-shrink-0">
                          {proj.techStack.join(", ")}
                        </span>
                      )}
                    </div>
                    {proj.bullets.filter((b) => b.trim()).length > 0 && (
                      <ul className="mt-0.5 space-y-0.5">
                        {proj.bullets
                          .filter((b) => b.trim())
                          .map((bullet, i) => (
                            <li key={i} className="flex gap-1 text-[#1e3a5f]">
                              <span className="flex-shrink-0 text-[#059669]">–</span>
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
        <div className="flex-1 min-w-0 border-l border-[#cbd5e1] pl-3">
          {hasEducation && (
            <>
              <SectionHeading title="Education" />
              <div className="space-y-1.5">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-[10px]">
                      {edu.degree || <EmptyField text="Degree" />}
                    </div>
                    {edu.college && (
                      <div className="text-[#4a6fa5] text-[9px]">{edu.college}</div>
                    )}
                    <div className="text-[#cbd5e1] text-[9px]">
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
              <SectionHeading title="Skills" />
              <div className="space-y-1.5">
                {skills.technical.length > 0 && (
                  <div>
                    <div className="text-[#4a6fa5] text-[9px] font-medium mb-0.5">Technical</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.technical.map((s, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-[#ecfdf5] text-[#059669] rounded text-[8.5px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.tools.length > 0 && (
                  <div>
                    <div className="text-[#4a6fa5] text-[9px] font-medium mb-0.5">Tools</div>
                    <div className="flex flex-wrap gap-1">
                      {skills.tools.map((s, i) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 bg-[#ecfdf5] text-[#059669] rounded text-[8.5px] font-medium"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {skills.languages.length > 0 && (
                  <div>
                    <div className="text-[#4a6fa5] text-[9px] font-medium mb-0.5">Languages</div>
                    <div className="text-[#1e3a5f] text-[9px]">
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