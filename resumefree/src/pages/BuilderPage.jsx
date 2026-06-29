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

  /* ── Auth check + load resume from dashboard ── */
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setUser(session.user);
    });

    // Dashboard se resume load karo (agar open & edit click kiya tha)
    const raw = localStorage.getItem("resumefree_load_resume");
    if (raw) {
      try {
        const { id, data } = JSON.parse(raw);
        // Zustand store me load karo
        useResumeStore.getState().loadResume?.(data);
        setSavedId(id);
        localStorage.removeItem("resumefree_load_resume");
      } catch (e) {
        console.error("Resume load error:", e);
      }
    }
  }, []);

  /* ── Save to Cloud ── */
  const handleSaveCloud = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const resumeData  = useResumeStore.getState();
    const personName  = resumeData?.personalInfo?.name?.trim();
    const title       = personName ? `${personName}'s Resume` : "My Resume";

    const { data, error } = await saveResume({
      userId:     user.id,
      title,
      data:       resumeData,
      existingId: savedId,
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

          {/* Action bar */}
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

            {/* ── Save to Cloud Button ── */}
            <button
              onClick={handleSaveCloud}
              disabled={saving}
              title={!user ? "Sign in to save" : savedId ? "Update saved resume" : "Save to cloud"}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                          transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${saveSuccess
                            ? "bg-[#1E8E5A] text-white"
                            : "bg-[#161A2E]/8 hover:bg-[#161A2E]/15 text-[#161A2E]/70 hover:text-[#161A2E]"
                          }`}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
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
                  {/* Cloud icon */}
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