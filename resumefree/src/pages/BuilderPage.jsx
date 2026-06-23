import { useState } from "react";
import { useResumeStore } from "../store/resumeStore";
import Navbar from "../components/layout/Navbar";
import PersonalInfoForm from "../components/builder/PersonalInfoForm";
import EducationForm from "../components/builder/EducationForm";
import ExperienceForm from "../components/builder/ExperienceForm";
import SkillsForm from "../components/builder/SkillsForm";
import ProjectsForm from "../components/builder/ProjectsForm";
import ResumePreview from "../components/builder/ResumePreview";
import DownloadButton from "../components/DownloadButton";
import ATSCheckPanel from "../components/ATSCheckPanel";
import JDMatcherPanel from "../components/premium/JDMatcherPanel";

const SECTIONS = [
  { id: "personal",   label: "Personal"   },
  { id: "education",  label: "Education"  },
  { id: "experience", label: "Experience" },
  { id: "skills",     label: "Skills"     },
  { id: "projects",   label: "Projects"   },
];

const FORM_MAP = {
  personal:   <PersonalInfoForm />,
  education:  <EducationForm />,
  experience: <ExperienceForm />,
  skills:     <SkillsForm />,
  projects:   <ProjectsForm />,
};

export default function BuilderPage() {
  const { activeSection, setActiveSection } = useResumeStore();
  const [mobileTab, setMobileTab] = useState("form");
  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  const goNext = () => {
    if (currentIdx < SECTIONS.length - 1)
      setActiveSection(SECTIONS[currentIdx + 1].id);
  };
  const goPrev = () => {
    if (currentIdx > 0)
      setActiveSection(SECTIONS[currentIdx - 1].id);
  };

  return (
    <div className="h-screen bg-[#F6F4EF] flex flex-col overflow-hidden">
      <Navbar />

      {/* ── Mobile tab switcher ── */}
      <div className="lg:hidden flex border-b border-[#DDD6C8] bg-white sticky top-14 z-40">
        {["form", "preview"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              mobileTab === tab
                ? "text-[#1E8E5A] border-b-2 border-[#1E8E5A]"
                : "text-[#161A2E]/40"
            }`}
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {tab === "form" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Form Panel ── */}
        <div className={`w-full lg:w-[52%] flex flex-col bg-[#F6F4EF] border-r border-[#DDD6C8] ${
          mobileTab === "preview" ? "hidden lg:flex" : "flex"
        }`}>

          {/* Section tabs */}
          <div className="flex overflow-x-auto border-b border-[#DDD6C8] bg-white [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex-shrink-0 px-4 py-3 text-xs font-semibold transition-colors
                             whitespace-nowrap border-b-2 -mb-px ${
                  activeSection === id
                    ? "text-[#161A2E] border-[#161A2E]"
                    : "text-[#161A2E]/40 border-transparent hover:text-[#161A2E]/70"
                }`}
                style={{ fontFamily: "'IBM Plex Mono', monospace" }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {FORM_MAP[activeSection]}
          </div>

          {/* Prev / Next footer */}
          <div className="border-t border-[#DDD6C8] bg-white px-4 sm:px-6 py-3
                           flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="text-sm text-[#161A2E]/50 hover:text-[#161A2E]
                         disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              ← Prev
            </button>
            <div className="flex items-center gap-1.5">
              {SECTIONS.map(({ id }, i) => (
                <span
                  key={id}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    id === activeSection
                      ? "bg-[#1E8E5A]"
                      : i < currentIdx
                      ? "bg-[#161A2E]/30"
                      : "bg-[#DDD6C8]"
                  }`}
                />
              ))}
            </div>
            <button
              onClick={goNext}
              disabled={currentIdx === SECTIONS.length - 1}
              className="text-sm font-semibold text-[#1E8E5A]
                         disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Next →
            </button>
          </div>
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className={`w-full lg:w-[48%] flex flex-col bg-[#EDEAE4] ${
          mobileTab === "form" ? "hidden lg:flex" : "flex"
        }`}>

          {/* Single compact action bar */}
          <div className="flex items-center gap-2 px-4 py-2.5
                           border-b border-[#DDD6C8] bg-white/70 backdrop-blur-sm">
            <span
              className="text-[10px] tracking-widest text-[#161A2E]/35 uppercase mr-auto"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Live Preview
            </span>
            <ATSCheckPanel />
            <JDMatcherPanel />
            <DownloadButton />
          </div>

          {/* Resume preview */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex justify-center">
            <div className="w-full max-w-[680px]">
              <ResumePreview />
            </div>
          </div>
        </div>

      </div>

      
    </div>
  );
}