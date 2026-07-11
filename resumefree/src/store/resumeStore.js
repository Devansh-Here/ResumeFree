// src/store/resumeStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useAuthStore } from "./authStore";

const DEFAULT_RESUME = {
  personal: {
    name: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    portfolio: "",
    // ── Photo (premium feature — see PhotoEditorPanel.jsx) ──
    photo: {
      originalDataUrl: null, // exactly what the user uploaded
      processedDataUrl: null, // bg-removed + new bg applied, final image used in templates
      backgroundType: "none", // 'none' | 'color' | 'image'
      backgroundValue: null, // hex color OR uploaded bg image dataUrl
    },
  },
  education: [
    // { id, degree, college, cgpa, year }
  ],
  experience: [
    // { id, company, role, duration, bullets: [""] }
  ],
  skills: {
    technical: [],
    tools: [],
    languages: [],
  },
  projects: [
    // { id, name, description, techStack: [], bullets: [""] }
  ],
  // ── Theme (premium feature — see ColorThemePicker.jsx) ──
  theme: {
    accentColor: "#059669",
  },
};

export const useResumeStore = create(
  persist(
    (set, get) => ({
      resume: DEFAULT_RESUME,
      activeSection: "personal",
      aiUsageCount: 0, // free tier: max 3

      // ── Template selection ──────────────────────────────
      selectedTemplateId: "classic",
      setTemplate: (templateId) => set({ selectedTemplateId: templateId }),

      // ── Section navigation ──────────────────────────────
      setActiveSection: (section) => set({ activeSection: section }),

      // ── Personal Info ───────────────────────────────────
      updatePersonal: (field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            personal: { ...state.resume.personal, [field]: value },
          },
        })),

      // ── Photo (premium — PhotoEditorPanel.jsx) ──────────
      updatePhoto: (partial) =>
        set((state) => ({
          resume: {
            ...state.resume,
            personal: {
              ...state.resume.personal,
              photo: { ...state.resume.personal.photo, ...partial },
            },
          },
        })),

      clearPhoto: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            personal: {
              ...state.resume.personal,
              photo: {
                originalDataUrl: null,
                processedDataUrl: null,
                backgroundType: "none",
                backgroundValue: null,
              },
            },
          },
        })),

      // ── Theme (premium — ColorThemePicker.jsx) ──────────
      updateTheme: (partial) =>
        set((state) => ({
          resume: {
            ...state.resume,
            theme: { ...state.resume.theme, ...partial },
          },
        })),

      // ── Education ───────────────────────────────────────
      addEducation: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: [
              ...state.resume.education,
              {
                id: Date.now(),
                degree: "",
                college: "",
                cgpa: "",
                year: "",
              },
            ],
          },
        })),

      updateEducation: (id, field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.map((edu) =>
              edu.id === id ? { ...edu, [field]: value } : edu
            ),
          },
        })),

      removeEducation: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            education: state.resume.education.filter((edu) => edu.id !== id),
          },
        })),

      // ── Experience ──────────────────────────────────────
      addExperience: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: [
              ...state.resume.experience,
              {
                id: Date.now(),
                company: "",
                role: "",
                duration: "",
                bullets: [""],
              },
            ],
          },
        })),

      updateExperience: (id, field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((exp) =>
              exp.id === id ? { ...exp, [field]: value } : exp
            ),
          },
        })),

      updateExperienceBullet: (expId, bulletIdx, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((exp) => {
              if (exp.id !== expId) return exp;
              const bullets = [...exp.bullets];
              bullets[bulletIdx] = value;
              return { ...exp, bullets };
            }),
          },
        })),

      addExperienceBullet: (expId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((exp) =>
              exp.id === expId
                ? { ...exp, bullets: [...exp.bullets, ""] }
                : exp
            ),
          },
        })),

      removeExperienceBullet: (expId, bulletIdx) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.map((exp) => {
              if (exp.id !== expId) return exp;
              const bullets = exp.bullets.filter((_, i) => i !== bulletIdx);
              return { ...exp, bullets: bullets.length ? bullets : [""] };
            }),
          },
        })),

      removeExperience: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            experience: state.resume.experience.filter((exp) => exp.id !== id),
          },
        })),

      // ── Skills ──────────────────────────────────────────
      updateSkills: (category, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            skills: { ...state.resume.skills, [category]: value },
          },
        })),

      // ── Projects ────────────────────────────────────────
      addProject: () =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: [
              ...state.resume.projects,
              {
                id: Date.now(),
                name: "",
                description: "",
                techStack: [],
                bullets: [""],
              },
            ],
          },
        })),

      updateProject: (id, field, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((proj) =>
              proj.id === id ? { ...proj, [field]: value } : proj
            ),
          },
        })),

      updateProjectBullet: (projId, bulletIdx, value) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((proj) => {
              if (proj.id !== projId) return proj;
              const bullets = [...proj.bullets];
              bullets[bulletIdx] = value;
              return { ...proj, bullets };
            }),
          },
        })),

      addProjectBullet: (projId) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((proj) =>
              proj.id === projId
                ? { ...proj, bullets: [...proj.bullets, ""] }
                : proj
            ),
          },
        })),

      removeProjectBullet: (projId, bulletIdx) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.map((proj) => {
              if (proj.id !== projId) return proj;
              const bullets = proj.bullets.filter((_, i) => i !== bulletIdx);
              return { ...proj, bullets: bullets.length ? bullets : [""] };
            }),
          },
        })),

      removeProject: (id) =>
        set((state) => ({
          resume: {
            ...state.resume,
            projects: state.resume.projects.filter((proj) => proj.id !== id),
          },
        })),

      // ── AI Usage (free tier: 3 max, unlimited for Premium) ──
      incrementAiUsage: () =>
        set((state) => ({ aiUsageCount: state.aiUsageCount + 1 })),

      canUseAi: () => {
        if (useAuthStore.getState().isPremium()) return true;
        return get().aiUsageCount < 3;
      },

      // ── Reset ───────────────────────────────────────────
      resetResume: () =>
        set({ resume: DEFAULT_RESUME, aiUsageCount: 0 }),
      // Note: selectedTemplateId is intentionally NOT reset here —
      // template choice is a user preference, not resume data.
    }),
    {
      name: "resumefree-data", // localStorage key
      version: 1, // bump this whenever DEFAULT_RESUME's shape changes again

      // ── Safe migration for existing users ──────────────────
      // Older localStorage data (saved before `theme`/`personal.photo`
      // existed) won't have those fields. Without this, calling
      // updateTheme()/updatePhoto() on an old resume would spread into
      // `undefined` and crash. This deep-merges persisted data ONTO the
      // current defaults — so old fields are preserved, and any NEW
      // fields we add later (theme, photo, and future ones) always get
      // a safe default without wiping the user's actual resume content.
      merge: (persistedState, currentState) => {
        const persisted = persistedState || {};
        const persistedResume = persisted.resume || {};

        return {
          ...currentState,
          ...persisted,
          resume: {
            ...currentState.resume,
            ...persistedResume,
            personal: {
              ...currentState.resume.personal,
              ...(persistedResume.personal || {}),
              photo: {
                ...currentState.resume.personal.photo,
                ...(persistedResume.personal?.photo || {}),
              },
            },
            theme: {
              ...currentState.resume.theme,
              ...(persistedResume.theme || {}),
            },
          },
        };
      },
    }
  )
);