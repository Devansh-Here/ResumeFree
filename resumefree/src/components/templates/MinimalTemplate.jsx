// src/components/templates/MinimalTemplate.jsx

function SectionHeading({ title }) {
  return (
    <div className="mt-6 mb-2.5">
      <span
        className="text-[9px] font-medium tracking-[0.25em] uppercase text-[#4a6fa5]"
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

export default function MinimalTemplate({ resume }) {
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
        lineHeight: "1.7",
        color: "#0a1628",
        padding: "40px 44px",
        minHeight: "842px",
      }}
    >
      {/* ── Header (left-aligned, no rule, lots of air) ── */}
      <div className="mb-6">
        <h1
          className="font-light text-[26px] tracking-tight text-[#0a1628]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>

        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-[#4a6fa5]">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
          {!personal.email && !personal.phone && !personal.address && (
            <EmptyField text="email · phone · city" />
          )}
        </div>

        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-[#4a6fa5]">
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
          <SectionHeading title="Education" />
          <div className="space-y-3">
            {education.map((edu) => (
              <div key={edu.id} className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="font-medium text-[11px]">
                    {edu.degree || <EmptyField text="Degree" />}
                  </span>
                  {edu.college && (
                    <span className="text-[#4a6fa5]">, {edu.college}</span>
                  )}
                </div>
                <div className="text-right flex-shrink-0 text-[#cbd5e1] text-[10px]">
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
          <SectionHeading title="Experience" />
          <div className="space-y-4">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-[11px]">
                    {exp.role || <EmptyField text="Role" />}
                    {exp.company && (
                      <span className="text-[#4a6fa5] font-normal">
                        , {exp.company}
                      </span>
                    )}
                  </span>
                  {exp.duration && (
                    <span className="text-[#cbd5e1] flex-shrink-0 text-[10px]">
                      {exp.duration}
                    </span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1.5 space-y-1 pl-0">
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[#1e3a5f] pl-3 border-l border-[#cbd5e1]">
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
          <SectionHeading title="Projects" />
          <div className="space-y-4">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-[11px]">
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                  {proj.techStack.length > 0 && (
                    <span className="text-[#cbd5e1] text-[10px] flex-shrink-0">
                      {proj.techStack.join(" · ")}
                    </span>
                  )}
                </div>
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1.5 space-y-1">
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[#1e3a5f] pl-3 border-l border-[#cbd5e1]">
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
          <SectionHeading title="Skills" />
          <div className="space-y-1.5 text-[#1e3a5f]">
            {skills.technical.length > 0 && (
              <div>
                <span className="text-[#4a6fa5]">Technical — </span>
                {skills.technical.join(", ")}
              </div>
            )}
            {skills.tools.length > 0 && (
              <div>
                <span className="text-[#4a6fa5]">Tools — </span>
                {skills.tools.join(", ")}
              </div>
            )}
            {skills.languages.length > 0 && (
              <div>
                <span className="text-[#4a6fa5]">Languages — </span>
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