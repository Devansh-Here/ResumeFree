// src/components/templates/CorporateEliteTemplate.jsx

function SectionHeading({ title, dark }) {
  return (
    <div className="mt-4 mb-2">
      <span
        className={`text-[10px] font-bold tracking-[0.15em] uppercase ${
          dark ? "text-white/90" : "text-[#0a1628]"
        }`}
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </span>
      <div
        className={`h-[2px] w-6 mt-1 ${dark ? "bg-[#059669]" : "bg-[#059669]"}`}
      />
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function CorporateEliteTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

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
      className="bg-white shadow-md rounded-sm w-full flex overflow-hidden"
      style={{
        fontFamily: "'Inter', sans-serif",
        fontSize: "11px",
        lineHeight: "1.5",
        minHeight: "842px",
      }}
    >
      {/* ── Sidebar ── */}
      <div
        className="flex-shrink-0"
        style={{ width: "34%", backgroundColor: "#0a1628", color: "white", padding: "30px 22px" }}
      >
        <h1
          className="text-[26px] leading-tight text-white mb-1"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>
        <div className="h-[2px] w-8 bg-[#059669] mb-4" />

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
            <SectionHeading title="Skills" dark />
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s, i) => (
                <span
                  key={i}
                  className="text-[9px] px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "#e2e8f0" }}
                >
                  {s}
                </span>
              ))}
            </div>
          </>
        )}

        {hasEducation && (
          <>
            <SectionHeading title="Education" dark />
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
            <SectionHeading title="Experience" />
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
                            <span className="flex-shrink-0 mt-0.5 text-[#059669]">▪</span>
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
            <div className="space-y-3">
              {projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-[11.5px]">
                      {proj.name || <EmptyField text="Project Name" />}
                    </span>
                    {proj.techStack.length > 0 && (
                      <span className="text-[#059669] text-[10px] flex-shrink-0">
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
                            <span className="flex-shrink-0 mt-0.5 text-[#059669]">▪</span>
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
  );
}