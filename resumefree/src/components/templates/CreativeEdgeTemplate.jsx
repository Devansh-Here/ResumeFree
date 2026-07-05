// src/components/templates/CreativeEdgeTemplate.jsx

function SectionHeading({ title }) {
  return (
    <div className="mt-4 mb-2.5">
      <span
        className="text-[11px] font-bold uppercase tracking-[0.12em]"
        style={{ color: "#059669", fontFamily: "'Inter', sans-serif" }}
      >
        {title}
      </span>
    </div>
  );
}

function EmptyField({ text }) {
  return <span className="text-[#cbd5e1] italic">{text}</span>;
}

export default function CreativeEdgeTemplate({ resume }) {
  const { personal, education, experience, skills, projects } = resume;

  const hasEducation = education.length > 0;
  const hasExperience = experience.length > 0;
  const hasSkills =
    skills.technical.length > 0 || skills.tools.length > 0 || skills.languages.length > 0;
  const hasProjects = projects.length > 0;
  const allSkills = [...skills.technical, ...skills.tools, ...skills.languages];

  return (
    <div
      className="bg-white shadow-md rounded-sm w-full"
      style={{ fontFamily: "'Inter', sans-serif", fontSize: "11px", lineHeight: "1.5", padding: "34px 38px", minHeight: "842px" }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-6 pb-4" style={{ borderBottom: "2px solid #0a1628" }}>
        <h1
          className="text-[30px] leading-none text-[#0a1628]"
          style={{ fontFamily: "'DM Serif Display', serif" }}
        >
          {personal.name || <EmptyField text="Your Name" />}
        </h1>
        <div
          className="text-right text-[10px] flex-shrink-0 pl-4"
          style={{ borderLeft: "2px solid #d1fae5", color: "#1e3a5f" }}
        >
          {personal.email && <div>{personal.email}</div>}
          {personal.phone && <div>{personal.phone}</div>}
          {personal.address && <div>{personal.address}</div>}
          {personal.linkedin && <div style={{ color: "#059669" }}>linkedin.com/in/{personal.linkedin}</div>}
          {personal.github && <div style={{ color: "#059669" }}>github.com/{personal.github}</div>}
          {personal.portfolio && <div style={{ color: "#059669" }}>{personal.portfolio}</div>}
        </div>
      </div>

      {hasExperience && (
        <>
          <SectionHeading title="Experience" />
          <div className="space-y-4">
            {experience.map((exp, idx) => (
              <div key={exp.id} className="relative pl-5">
                <span
                  className="absolute left-0 top-1 w-2 h-2 rounded-full"
                  style={{ backgroundColor: "#059669" }}
                />
                {idx !== experience.length - 1 && (
                  <span
                    className="absolute left-[3px] top-3 bottom-[-16px] w-px"
                    style={{ backgroundColor: "#cbd5e1" }}
                  />
                )}
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
                  <ul className="mt-1 space-y-0.5">
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[#1e3a5f]">— {bullet}</li>
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
          <div className="grid grid-cols-2 gap-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="rounded-2xl p-3"
                style={{ backgroundColor: "#ecfdf5" }}
              >
                <span className="font-semibold text-[11px] text-[#0a1628]">
                  {proj.name || <EmptyField text="Project Name" />}
                </span>
                {proj.techStack.length > 0 && (
                  <div className="text-[9.5px] mt-0.5" style={{ color: "#047857" }}>
                    {proj.techStack.join(" · ")}
                  </div>
                )}
                {proj.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 space-y-0.5">
                    {proj.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i} className="text-[#1e3a5f] text-[10.5px]">— {bullet}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <div className="flex gap-8">
        {hasEducation && (
          <div className="flex-1">
            <SectionHeading title="Education" />
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id}>
                  <div className="font-semibold text-[11px] text-[#0a1628]">
                    {edu.degree || <EmptyField text="Degree" />}
                  </div>
                  <div className="text-[10px] text-[#4a6fa5]">
                    {edu.college} {edu.year && <span>· {edu.year}</span>} {edu.cgpa && <span>· {edu.cgpa}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {hasSkills && (
          <div className="flex-1">
            <SectionHeading title="Skills" />
            <div className="flex flex-wrap gap-1.5">
              {allSkills.map((s, i) => (
                <span
                  key={i}
                  className="text-[9.5px] px-2 py-0.5 rounded-full"
                  style={{
                    border: i % 2 === 0 ? "1px solid #059669" : "1px solid #cbd5e1",
                    color: i % 2 === 0 ? "#059669" : "#4a6fa5",
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