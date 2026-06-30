// src/pages/BuilderPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResumeStore } from "../store/resumeStore";
import { supabase } from "../utils/supabaseClient";
import { useResumeCloud } from "../hooks/useResumeCloud";
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
  const [mobileTab, setMobileTab]   = useState("form");
  const [savedId, setSavedId]       = useState(null);
  const [user, setUser]             = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const { saveResume, saving }      = useResumeCloud();
  const navigate                    = useNavigate();
  const currentIdx = SECTIONS.findIndex((s) => s.id === activeSection);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });

    const raw = localStorage.getItem("resumefree_load_resume");
    if (raw) {
      try {
        const { id, data } = JSON.parse(raw);
        useResumeStore.getState().loadResume?.(data);
        setSavedId(id);
        localStorage.removeItem("resumefree_load_resume");
      } catch (e) {
        console.error("Resume load error:", e);
      }
    }
  }, []);

  const handleSaveCloud = async () => {
    if (!user) { navigate("/auth"); return; }

    const resumeData = useResumeStore.getState();
    const personName = resumeData?.personalInfo?.name?.trim();
    const title      = personName ? `${personName}'s Resume` : "My Resume";

    const { data, error } = await saveResume({
      userId: user.id, title, data: resumeData, existingId: savedId,
    });

    if (data) {
      setSavedId(data.id);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } else {
      console.error("Save failed:", error);
    }
  };

  const goNext = () => {
    if (currentIdx < SECTIONS.length - 1)
      setActiveSection(SECTIONS[currentIdx + 1].id);
  };
  const goPrev = () => {
    if (currentIdx > 0)
      setActiveSection(SECTIONS[currentIdx - 1].id);
  };

  return (
    <div className="h-screen bg-[#e8edf2] flex flex-col overflow-hidden">
      <Navbar />

      {/* ── Mobile tab switcher ── */}
      <div className="lg:hidden flex border-b border-[#cbd5e1] bg-[#fdfdfe] sticky top-14 z-40">
        {["form", "preview"].map((tab) => (
          <button
            key={tab}
            onClick={() => setMobileTab(tab)}
            className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-widest transition-colors ${
              mobileTab === tab
                ? "text-[#059669] border-b-2 border-[#059669]"
                : "text-[#4a6fa5]/60 hover:text-[#1e3a5f]"
            }`}
          >
            {tab === "form" ? "Edit" : "Preview"}
          </button>
        ))}
      </div>

      {/* ── Floating builder card — separated from navbar by grey gap ── */}
      <div className="flex flex-1 overflow-hidden m-3 mt-3 rounded-3xl border border-[#cbd5e1]/60
                       shadow-[0_4px_16px_-4px_rgba(10,22,40,0.10),0_1px_3px_rgba(10,22,40,0.06)]
                       bg-white relative z-10">

        {/* ── LEFT: Form Panel ── */}
        <div className={`w-full lg:w-[52%] flex flex-col bg-[#f8fafc] border-r border-[#cbd5e1] rounded-l-3xl overflow-hidden ${
          mobileTab === "preview" ? "hidden lg:flex" : "flex"
        }`}>

          {/* Section tabs — h-[45px] fixed so right panel bar aligns */}
          <div className="h-[45px] flex overflow-x-auto border-b border-[#cbd5e1] bg-[#fdfdfe] [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
            {SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => setActiveSection(id)}
                className={`flex-shrink-0 px-5 h-full text-xs font-semibold tracking-wider uppercase
                             transition-all whitespace-nowrap border-b-2 -mb-px ${
                  activeSection === id
                    ? "text-[#0a1628] border-[#059669]"
                    : "text-[#4a6fa5]/60 border-transparent hover:text-[#1e3a5f] hover:border-[#cbd5e1]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7">
            {FORM_MAP[activeSection]}
          </div>

          {/* Prev / Next footer */}
          <div className="border-t border-[#cbd5e1] bg-[#fdfdfe] px-5 sm:px-7 py-3
                           flex items-center justify-between">
            <button
              onClick={goPrev}
              disabled={currentIdx === 0}
              className="text-sm text-[#4a6fa5] hover:text-[#0a1628]
                         disabled:opacity-25 disabled:cursor-not-allowed transition-colors font-medium"
            >
              ← Prev
            </button>

            {/* Progress dots */}
            <div className="flex items-center gap-2">
              {SECTIONS.map(({ id }, i) => (
                <span
                  key={id}
                  className={`rounded-full transition-all duration-200 ${
                    id === activeSection
                      ? "w-5 h-1.5 bg-[#059669]"
                      : i < currentIdx
                      ? "w-1.5 h-1.5 bg-[#059669]/40"
                      : "w-1.5 h-1.5 bg-[#cbd5e1]"
                  }`}
                />
              ))}
            </div>

            <button
              onClick={goNext}
              disabled={currentIdx === SECTIONS.length - 1}
              className="text-sm font-semibold text-[#059669] hover:text-[#047857]
                         disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >
              Next →
            </button>
          </div>
        </div>

        {/* ── RIGHT: Preview Panel ── */}
        <div className={`w-full lg:w-[48%] flex flex-col bg-[#ecfdf5] rounded-r-3xl overflow-hidden ${
          mobileTab === "form" ? "hidden lg:flex" : "flex"
        }`}>

          {/* Action bar — same h-[45px] as tab bar so border aligns perfectly */}
          <div className="h-[45px] flex items-center gap-2 px-4
                           border-b border-[#cbd5e1] bg-[#fdfdfe]/90 backdrop-blur-sm">
            <span className="text-[10px] tracking-widest text-[#4a6fa5]/60 uppercase mr-auto font-semibold">
              Live Preview
            </span>

            <ATSCheckPanel />
            <JDMatcherPanel />

            {/* Save to Cloud */}
            <button
              onClick={handleSaveCloud}
              disabled={saving}
              title={!user ? "Sign in to save" : savedId ? "Update saved resume" : "Save to cloud"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold
                          transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${saveSuccess
                            ? "bg-[#059669] text-white"
                            : "bg-[#0a1628]/6 hover:bg-[#0a1628]/12 text-[#1e3a5f] hover:text-[#0a1628]"
                          }`}
            >
              {saving ? (
                <>
                  <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving…
                </>
              ) : saveSuccess ? (
                <>✓ Saved</>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {savedId ? "Update" : "Save"}
                </>
              )}
            </button>

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