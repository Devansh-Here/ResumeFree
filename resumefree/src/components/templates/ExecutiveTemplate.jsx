// src/components/templates/ExecutiveTemplate.jsx

function SectionHeading({ title }) {
  return (
    <div className="mt-5 mb-2 flex items-center gap-3">
      <span
        className="text-[11px] font-semibold tracking-[0.08em] uppercase text-[#0a1628] whitespace-nowrap"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </span>
      <div className="flex-1 h-px bg-[#cbd5e1]" />
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function ExecutiveTemplate({ resume }) {
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
        lineHeight: "1.55",
        color: "#0a1628",
        padding: "36px 40px",
        minHeight: "842px",
      }}
    >
      {/* ── Header: serif name, centered, formal double-rule ── */}
      <div className="text-center mb-4 pb-3" style={{ borderBottom: "2px solid #0a1628" }}>
        <h1
          className="text-[26px] tracking-tight text-[#0a1628]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>

        <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 mt-2 text-[10px] text-[#1e3a5f] tracking-wide">
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
          <div className="flex flex-wrap justify-center gap-x-3 mt-1 text-[10px] text-[#4a6fa5]">
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* ── Education (leads — MBA/executive convention) ── */}
      {hasEducation && (
        <>
          <SectionHeading title="Education" />
          <div className="space-y-2.5">
            {education.map((edu) => (
              <div key={edu.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-semibold text-[12px]"
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                      {edu.degree || <EmptyField text="Degree" />}
                    </span>
                    {edu.college && (
                      <div className="text-[#1e3a5f] text-[10.5px]">{edu.college}</div>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0 text-[#4a6fa5] text-[10px]">
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
          <SectionHeading title="Professional Experience" />
          <div className="space-y-3.5">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span
                      className="font-semibold text-[12px]"
                      style={{ fontFamily: "'DM Serif Display', serif" }}
                    >
                      {exp.company || <EmptyField text="Company" />}
                    </span>
                    {exp.role && (
                      <span className="text-[#1e3a5f] text-[10.5px] italic"> — {exp.role}</span>
                    )}
                  </div>
                  {exp.duration && (
                    <span className="text-[#4a6fa5] flex-shrink-0 text-[10px]">
                      {exp.duration}
                    </span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-4">
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[#1e3a5f]" style={{ listStyleType: "disc" }}>
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
          <SectionHeading title="Key Projects" />
          <div className="space-y-3">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-start justify-between gap-2">
                  <span
                    className="font-semibold text-[11.5px]"
                    style={{ fontFamily: "'DM Serif Display', serif" }}
                  >
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                  {proj.techStack.length > 0 && (
                    <span className="text-[#4a6fa5] text-[10px] italic flex-shrink-0">
                      {proj.techStack.join(", ")}
                    </span>
                  )}
                </div>
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-4">
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[#1e3a5f]" style={{ listStyleType: "disc" }}>
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
          <SectionHeading title="Core Competencies" />
          <div className="space-y-1.5">
            {skills.technical.length > 0 && (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0 text-[10.5px]">Technical:</span>
                <span className="text-[#1e3a5f] text-[10.5px]">
                  {skills.technical.join(" · ")}
                </span>
              </div>
            )}
            {skills.tools.length > 0 && (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0 text-[10.5px]">Tools:</span>
                <span className="text-[#1e3a5f] text-[10.5px]">
                  {skills.tools.join(" · ")}
                </span>
              </div>
            )}
            {skills.languages.length > 0 && (
              <div className="flex gap-2">
                <span className="font-semibold flex-shrink-0 text-[10.5px]">Languages:</span>
                <span className="text-[#1e3a5f] text-[10.5px]">
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