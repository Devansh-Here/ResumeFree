// src/components/templates/StartupBoldTemplate.jsx

function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-2 mt-4 mb-2">
      <span className="w-2 h-2 rounded-sm bg-[#059669] flex-shrink-0" />
      <span
        className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#0a1628]"
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

export default function StartupBoldTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;

  const chip = (text, bg, color) => (
    <span
      className="text-[9.5px] px-2.5 py-1 rounded-full font-medium"
      style={{ backgroundColor: bg, color }}
    >
      {text}
    </span>
  );

  return (
    <div
      className="bg-white shadow-md rounded-sm w-full overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", lineHeight: "1.5", minHeight: "842px" }}
    >
      {/* ── Header band ── */}
      <div style={{ backgroundColor: "#059669", padding: "26px 34px" }}>
        <h1 className="text-[24px] font-bold text-white tracking-tight">
          {personal.name || <EmptyField text="Your Name" />}
        </h1>
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-[10px]" style={{ color: "#d1fae5" }}>
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
        </div>
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap gap-x-3 mt-1 text-[10px] text-white/90 font-medium">
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      <div style={{ padding: "24px 34px", color: "#0a1628" }}>
        {hasSkills && (
          <>
            <SectionHeading title="Skills" />
            <div className="flex flex-wrap gap-1.5">
              {skills.technical.map((s, i) => chip(s, "#d1fae5", "#065f46"))}
              {skills.tools.map((s, i) => chip(s, "#ecfdf5", "#047857"))}
              {skills.languages.map((s, i) => chip(s, "#f8fafc", "#4a6fa5"))}
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
                    <span className="font-semibold text-[11.5px]">
                      {exp.role || <EmptyField text="Role" />}
                      {exp.company && (
                        <span className="text-[#059669] font-medium"> @ {exp.company}</span>
                      )}
                    </span>
                    {exp.duration && (
                      <span
                        className="flex-shrink-0 text-[9.5px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "#f8fafc", color: "#4a6fa5" }}
                      >
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
                            <span className="flex-shrink-0 mt-0.5 text-[#059669]">→</span>
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
                <div
                  key={proj.id}
                  className="rounded-xl border border-[#cbd5e1]/60 p-3"
                  style={{ backgroundColor: "#fdfdfe" }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[11px]">
                      {proj.name || <EmptyField text="Project Name" />}
                    </span>
                  </div>
                  {proj.techStack.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {proj.techStack.map((t, i) => (
                        <span
                          key={i}
                          className="text-[9px] px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "#ecfdf5", color: "#047857" }}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {proj.bullets.filter((b) => b.trim()).length > 0 && (
                    <ul className="mt-1.5 space-y-0.5 pl-3">
                      {proj.bullets
                        .filter((b) => b.trim())
                        .map((bullet, i) => (
                          <li key={i} className="flex gap-1.5 text-[#1e3a5f]">
                            <span className="flex-shrink-0 mt-0.5 text-[#059669]">→</span>
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
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-semibold text-[11px]">
                      {edu.degree || <EmptyField text="Degree" />}
                    </span>
                    {edu.college && <span className="text-[#4a6fa5]"> · {edu.college}</span>}
                  </div>
                  <div className="text-right text-[#4a6fa5] flex-shrink-0">
                    {edu.year} {edu.cgpa && <span>· {edu.cgpa}</span>}
                  </div>
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
  );
}