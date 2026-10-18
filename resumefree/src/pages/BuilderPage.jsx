import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useResumeStore } from "../store/resumeStore";
import { supabase } from "../utils/supabaseClient";
import { useResumeCloud } from "../hooks/useResumeCloud";
import Navbar from "../components/layout/Navbar";
import Sidebar from "../components/builder/Sidebar";
import PersonalInfoForm from "../components/builder/PersonalInfoForm";
import EducationForm from "../components/builder/EducationForm";
import ExperienceForm from "../components/builder/ExperienceForm";
import SkillsForm from "../components/builder/SkillsForm";
import ProjectsForm from "../components/builder/ProjectsForm";
import ResumePreview from "../components/builder/ResumePreview";
import DownloadButton from "../components/DownloadButton";

const SECTIONS = [
  { id: "personal",   label: "Personal"   },
  { id: "education",  label: "Education"  },
  { id: "experience", label: "Experience" },
  { id: "skills",     label: "Skills"     },
  { id: "projects",   label: "Projects"   },
];

const MOBILE_TABS = [
  { id: "form",    label: "Edit"    },
  { id: "preview", label: "Preview" },
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

  // ── Sliding underline: desktop section tabs ──
  const tabRefs = useRef({});
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = tabRefs.current[activeSection];
    if (el) {
      setUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeSection]);

  // ── Sliding underline: mobile Edit/Preview switcher ──
  const mobileTabRefs = useRef({});
  const [mobileUnderlineStyle, setMobileUnderlineStyle] = useState({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const el = mobileTabRefs.current[mobileTab];
    if (el) {
      setMobileUnderlineStyle({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [mobileTab]);

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
    <div className="h-screen bg-soft-snow flex flex-col overflow-hidden">
      <Navbar />

      {/* ── Mobile tab switcher — now with sliding underline ── */}
      <div className="lg:hidden flex border-b border-mist bg-paper-white sticky top-14 z-40 relative">
        {MOBILE_TABS.map(({ id, label }) => (
          <button
            key={id}
            ref={(el) => (mobileTabRefs.current[id] = el)}
            onClick={() => setMobileTab(id)}
            className={`flex-1 py-2 font-mono text-[11px] font-semibold uppercase tracking-widest transition-colors ${
              mobileTab === id
                ? "text-iris-violet"
                : "text-fog hover:text-ash"
            }`}
          >
            {label}
          </button>
        ))}

        <span
          className="absolute bottom-0 h-[2px] bg-iris-violet transition-all duration-300"
          style={{
            left: mobileUnderlineStyle.left,
            width: mobileUnderlineStyle.width,
            transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Feature Sidebar (desktop only — mobile needs a separate entry point, see note) ── */}
        <div className="hidden lg:flex my-3 ml-3">
          <Sidebar />
        </div>

        {/* ── Floating builder card ── */}
        <div className="flex flex-1 overflow-hidden m-3 rounded-[4px] border border-mist
                         bg-paper-white relative z-10">

          {/* ── LEFT: Form Panel ── */}
          <div className={`w-full lg:w-[52%] flex flex-col bg-paper-white border-r border-mist rounded-l-[4px] overflow-hidden ${
            mobileTab === "preview" ? "hidden lg:flex" : "flex"
          }`}>

            <div className="h-[2.8125rem] flex overflow-x-auto border-b border-mist bg-soft-snow relative [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              {SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  ref={(el) => (tabRefs.current[id] = el)}
                  onClick={() => setActiveSection(id)}
                  className={`flex-shrink-0 px-4 h-full font-mono text-[11px] font-semibold tracking-wider uppercase
                               transition-colors whitespace-nowrap ${
                    activeSection === id
                      ? "text-graphite-ink"
                      : "text-fog hover:text-ash"
                  }`}
                >
                  {label}
                </button>
              ))}

              {/* Sliding underline — travels between tabs on click */}
              <span
                className="absolute bottom-0 h-[2px] bg-iris-violet transition-all duration-300"
                style={{
                  left: underlineStyle.left,
                  width: underlineStyle.width,
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {FORM_MAP[activeSection]}
            </div>

            <div className="border-t border-mist bg-soft-snow px-4 sm:px-6 py-2.5
                             flex items-center justify-between">
              <button
                onClick={goPrev}
                disabled={currentIdx === 0}
                className="font-body text-[14px] text-ash hover:text-graphite-ink
                           disabled:opacity-25 disabled:cursor-not-allowed transition-colors font-medium"
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1.5">
                {SECTIONS.map(({ id }, i) => (
                  <span
                    key={id}
                    className={`rounded-full transition-all duration-200 ${
                      id === activeSection
                        ? "w-4 h-1 bg-iris-violet"
                        : i < currentIdx
                        ? "w-1 h-1 bg-iris-violet/40"
                        : "w-1 h-1 bg-mist"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={currentIdx === SECTIONS.length - 1}
                className="font-body text-[14px] font-semibold text-iris-violet hover:text-deep-iris
                           disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>

          {/* ── RIGHT: Preview Panel — subtle drifting violet gradient background ── */}
          <div className={`w-full lg:w-[48%] flex flex-col rounded-r-[4px] overflow-hidden relative bg-paper-white ${
            mobileTab === "form" ? "hidden lg:flex" : "flex"
          }`}>

            {/* Decorative animated gradient layer — sits behind everything in this panel.
                Opacity bumped up (0.10→0.30 / 0.08→0.24) and blur reduced (48px→36px)
                so the violet motion is actually visible, not just theoretically present. */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div
                className="rf-gradient-drift absolute"
                style={{
                  inset: "-20%",
                  background:
                    "radial-gradient(circle at 28% 28%, rgba(116,81,242,0.30), transparent 58%), " +
                    "radial-gradient(circle at 72% 68%, rgba(89,82,161,0.24), transparent 58%)",
                  filter: "blur(36px)",
                }}
              />
            </div>

            <div className="h-[2.8125rem] flex items-center gap-2 px-3.5
                             border-b border-mist bg-paper-white/90 backdrop-blur-sm relative z-10">
              <span className="font-mono text-[11px] tracking-widest text-fog uppercase mr-auto font-semibold">
                Live Preview
              </span>

              <button
                onClick={handleSaveCloud}
                disabled={saving}
                title={!user ? "Sign in to save" : savedId ? "Update saved resume" : "Save to cloud"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full font-body text-[11px] font-semibold
                            transition-all disabled:opacity-50 disabled:cursor-not-allowed
                            ${saveSuccess
                              ? "bg-success-text text-white"
                              : "bg-graphite-ink/6 hover:bg-graphite-ink/12 text-ash hover:text-graphite-ink"
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
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {savedId ? "Update" : "Save"}
                  </>
                )}
              </button>

              <DownloadButton />
            </div>

            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 flex justify-center relative z-10">
              <div
                className="w-full max-w-[42.5rem]"
                style={{ zoom: 0.90 }}
              >
                <ResumePreview />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}