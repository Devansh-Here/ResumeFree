// src/components/templates/TechnicalProTemplate.jsx

function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <span className="text-[#059669] text-[11px]">{"//"}</span>
      <span
        className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#0a1628]"
      >
        {title}
      </span>
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

function SkillCol({ label, items }) {
  if (!items.length) return null;
  return (
    <div
      className="flex-1 rounded-lg p-2.5"
      style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1" }}
    >
      <div className="text-[9px] font-bold uppercase tracking-wider text-[#4a6fa5] mb-1">
        {label}
      </div>
      <div className="flex flex-wrap gap-1">
        {items.map((s, i) => (
          <span
            key={i}
            className="text-[9px] px-1.5 py-0.5 rounded"
            style={{ backgroundColor: "#0a1628", color: "#d1fae5" }}
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

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  return (
    <div
      className="bg-white shadow-md rounded-sm w-full"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", lineHeight: "1.5", padding: "30px 34px", minHeight: "842px" }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 pb-3" style={{ borderBottom: "1px solid #cbd5e1" }}>
        <div>
          <h1 className="text-[22px] font-bold text-[#0a1628] tracking-tight">
            {personal.name || <EmptyField text="Your Name" />}
          </h1>
          <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-[#4a6fa5]">
            {personal.email && <span>{personal.email}</span>}
            {personal.phone && <span>{personal.phone}</span>}
            {personal.address && <span>{personal.address}</span>}
          </div>
          {(personal.linkedin || personal.github || personal.portfolio) && (
            <div className="flex flex-wrap gap-x-3 mt-0.5 text-[10px]" style={{ color: "#059669" }}>
              {personal.github && <span>github.com/{personal.github}</span>}
              {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
              {personal.portfolio && <span>{personal.portfolio}</span>}
            </div>
          )}
        </div>
      </div>

      {hasSkills && (
        <>
          <SectionHeading title="Stack" />
          <div className="flex gap-2">
            <SkillCol label="Technical" items={skills.technical} />
            <SkillCol label="Tools" items={skills.tools} />
            <SkillCol label="Languages" items={skills.languages} />
          </div>
        </>
      )}

      {hasExperience && (
        <>
          <SectionHeading title="Experience" />
          <div className="space-y-3">
            {experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[11.5px] text-[#0a1628]">
                    {exp.role || <EmptyField text="Role" />}
                    {exp.company && <span className="text-[#4a6fa5] font-normal"> · {exp.company}</span>}
                  </span>
                  {exp.duration && (
                    <span className="text-[#4a6fa5] text-[10px] flex-shrink-0">{exp.duration}</span>
                  )}
                </div>
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="flex gap-1.5 text-[#1e3a5f]">
                          <span className="flex-shrink-0 text-[#059669]">▸</span>
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
          <div className="space-y-2.5">
            {projects.map((proj) => (
              <div key={proj.id}>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-[11px] text-[#0a1628]">
                    {proj.name || <EmptyField text="Project Name" />}
                  </span>
                </div>
                {proj.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {proj.techStack.map((t, i) => (
                      <span
                        key={i}
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", color: "#1e3a5f" }}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 space-y-0.5 pl-3">
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="flex gap-1.5 text-[#1e3a5f]">
                          <span className="flex-shrink-0 text-[#059669]">▸</span>
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
          <SectionHeading title="Education" />
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {education.map((edu) => (
              <div key={edu.id} className="text-[10.5px]">
                <span className="font-semibold text-[#0a1628]">{edu.degree || <EmptyField text="Degree" />}</span>
                <span className="text-[#4a6fa5]"> · {edu.college} {edu.year && `· ${edu.year}`} {edu.cgpa && `· ${edu.cgpa}`}</span>
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