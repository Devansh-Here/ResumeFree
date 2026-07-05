// src/components/templates/GridProfessionalTemplate.jsx

function SectionHeading({ title }) {
  return (
    <div className="mb-2">
      <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#0a1628]">
        {title}
      </span>
      <div className="h-px bg-[#cbd5e1] mt-1" />
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function GridProfessionalTemplate({ resume }) {
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
      <div className="text-center pb-3 mb-4" style={{ borderBottom: "2px solid #0a1628" }}>
        <h1 className="text-[22px] font-bold text-[#0a1628]">
          {personal.name || <EmptyField text="Your Name" />}
        </h1>
        <div className="flex flex-wrap justify-center gap-x-3 mt-1 text-[10px] text-[#1e3a5f]">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>· {personal.phone}</span>}
          {personal.address && <span>· {personal.address}</span>}
        </div>
        {(personal.linkedin || personal.github || personal.portfolio) && (
          <div className="flex flex-wrap justify-center gap-x-3 mt-0.5 text-[10px] text-[#059669]">
            {personal.linkedin && <span>linkedin.com/in/{personal.linkedin}</span>}
            {personal.github && <span>github.com/{personal.github}</span>}
            {personal.portfolio && <span>{personal.portfolio}</span>}
          </div>
        )}
      </div>

      {/* ── Grid ── */}
      <div className="flex gap-4">
        {/* Left col */}
        <div className="flex-shrink-0" style={{ width: "30%" }}>
          {hasSkills && (
            <div className="rounded-lg border border-[#cbd5e1] p-3 mb-3">
              <SectionHeading title="Skills" />
              <div className="space-y-1.5">
                {skills.technical.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold text-[#4a6fa5] uppercase">Technical</div>
                    <div className="text-[10px] text-[#1e3a5f]">{skills.technical.join(", ")}</div>
                  </div>
                )}
                {skills.tools.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold text-[#4a6fa5] uppercase">Tools</div>
                    <div className="text-[10px] text-[#1e3a5f]">{skills.tools.join(", ")}</div>
                  </div>
                )}
                {skills.languages.length > 0 && (
                  <div>
                    <div className="text-[9px] font-bold text-[#4a6fa5] uppercase">Languages</div>
                    <div className="text-[10px] text-[#1e3a5f]">{skills.languages.join(", ")}</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasEducation && (
            <div className="rounded-lg border border-[#cbd5e1] p-3">
              <SectionHeading title="Education" />
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <div className="font-semibold text-[10.5px] text-[#0a1628]">
                      {edu.degree || <EmptyField text="Degree" />}
                    </div>
                    <div className="text-[10px] text-[#4a6fa5]">{edu.college}</div>
                    <div className="text-[9.5px] text-[#4a6fa5]/80">
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
            <div className="rounded-lg border border-[#cbd5e1] p-3 mb-3">
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
                              <span className="flex-shrink-0 mt-0.5">•</span>
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
            <div className="rounded-lg border border-[#cbd5e1] p-3">
              <SectionHeading title="Projects" />
              <div className="space-y-3">
                {projects.map((proj) => (
                  <div key={proj.id}>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-[11px] text-[#0a1628]">
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