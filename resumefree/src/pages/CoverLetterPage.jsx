// src/pages/CoverLetterPage.jsx
import { useState } from "react";
import Navbar from "../components/layout/Navbar";
import UpgradeModal from "../components/premium/UpgradeModal";
import { useResumeStore } from "../store/resumeStore";
import { useAuthStore } from "../store/authStore";
import generateCoverLetterPDF from "../utils/generateCoverLetterPDF";

const inputClass = "w-full bg-white border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all duration-150";
const labelClass = "block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-2";

/* ── Builds a plain-text background summary from resumeStore data,
   used to feed the AI prompt without re-asking the user to retype
   everything they already entered while building their resume. ── */
function buildBackgroundFromResume(resume) {
  const parts = [];

  if (resume.education?.length) {
    parts.push(
      "Education: " +
        resume.education
          .map((e) => `${e.degree || ""} at ${e.college || ""}${e.cgpa ? ` (CGPA ${e.cgpa})` : ""}`)
          .join("; ")
    );
  }

  const allSkills = [
    ...(resume.skills?.technical || []),
    ...(resume.skills?.tools || []),
    ...(resume.skills?.languages || []),
  ];
  if (allSkills.length) parts.push("Skills: " + allSkills.join(", "));

  if (resume.experience?.length) {
    resume.experience.forEach((exp) => {
      const bullets = (exp.bullets || []).filter(Boolean).join("; ");
      parts.push(
        `Experience — ${exp.role || ""} at ${exp.company || ""}${exp.duration ? ` (${exp.duration})` : ""}: ${bullets}`
      );
    });
  }

  if (resume.projects?.length) {
    resume.projects.forEach((p) => {
      const bullets = (p.bullets || []).filter(Boolean).join("; ");
      const tech = (p.techStack || []).join(", ");
      parts.push(`Project — ${p.name || ""}${tech ? ` (${tech})` : ""}: ${p.description || ""} ${bullets}`);
    });
  }

  return parts.join("\n");
}

/* ── Shared "alive" action button — same idle/loading/done/error
   language as the resume DownloadButton (hover bob, loading sweep +
   dots, success pop + burst, error shake), reused here for both
   "Generate" and "Download PDF" so the whole app feels consistent. ── */
function AliveActionButton({ status, onClick, disabled, idleLabel, loadingLabel, doneLabel, errorLabel, idleIconPath }) {
  const bg =
    status === "done" ? "bg-[#059669]" :
    status === "error" ? "bg-red-600" :
                          "bg-[#0a1628]";

  return (
    <button
      onClick={onClick}
      disabled={status === "loading" || disabled}
      className={`group relative overflow-hidden flex items-center justify-center gap-2
                  min-w-[168px] h-11 px-5 text-[13px] font-semibold text-white
                  rounded-full transition-colors duration-300 ease-out
                  ${bg} ${status === "error" ? "rf-shake" : ""}
                  ${(status === "loading" || disabled) ? "cursor-not-allowed opacity-90" : "cursor-pointer"}`}
    >
      {status === "loading" && (
        <span className="absolute bottom-0 left-0 w-full h-[3px] overflow-hidden">
          <span className="block h-full w-1/3 bg-white/80 rf-sweep" />
        </span>
      )}

      <span className="relative flex items-center justify-center w-3.5 h-3.5">
        {status === "idle" && (
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 rf-bob-trigger">
            <path d={idleIconPath} stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="rf-arrow" />
          </svg>
        )}
        {status === "loading" && (
          <span className="flex items-end gap-[3px] h-3">
            <span className="w-[3px] h-[3px] rounded-full bg-white rf-dot" style={{ animationDelay: "0ms" }} />
            <span className="w-[3px] h-[3px] rounded-full bg-white rf-dot" style={{ animationDelay: "120ms" }} />
            <span className="w-[3px] h-[3px] rounded-full bg-white rf-dot" style={{ animationDelay: "240ms" }} />
          </span>
        )}
        {status === "done" && (
          <span className="relative inline-flex">
            <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5 rf-pop">
              <path d="M3 8.5l3.2 3.2L13 4.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {[{ tx: "-10px", ty: "-8px" }, { tx: "10px", ty: "-8px" }, { tx: "-8px", ty: "8px" }, { tx: "8px", ty: "8px" }].map((p, i) => (
              <span key={i} className="absolute top-1/2 left-1/2 w-[3px] h-[3px] rounded-full bg-white rf-burst" style={{ "--tx": p.tx, "--ty": p.ty, animationDelay: `${i * 30}ms` }} />
            ))}
          </span>
        )}
        {status === "error" && (
          <svg viewBox="0 0 16 16" fill="none" className="w-3.5 h-3.5">
            <path d="M4 4l8 8M12 4l-8 8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        )}
      </span>

      <span className="relative">
        {status === "idle" && idleLabel}
        {status === "loading" && loadingLabel}
        {status === "done" && doneLabel}
        {status === "error" && errorLabel}
      </span>
    </button>
  );
}

export default function CoverLetterPage() {
  const resume = useResumeStore((s) => s.resume);
  const isPremium = useAuthStore((s) => s.isPremium());
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const hasResumeData = !!(
    resume.personal?.name ||
    resume.experience?.length ||
    resume.projects?.length ||
    resume.education?.length
  );

  const [useResumeData, setUseResumeData] = useState(hasResumeData);
  const [name, setName] = useState(resume.personal?.name || "");
  const [email, setEmail] = useState(resume.personal?.email || "");
  const [phone, setPhone] = useState(resume.personal?.phone || "");
  const [manualBackground, setManualBackground] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);

  const [genStatus, setGenStatus] = useState("idle");
  const [genError, setGenError] = useState("");
  const [dlStatus, setDlStatus] = useState("idle");

  const effectiveBackground = useResumeData ? buildBackgroundFromResume(resume) : manualBackground;

  async function handleGenerate() {
    if (genStatus === "loading") return;
    setGenError("");

    if (!effectiveBackground || effectiveBackground.trim().length < 20) {
      setGenError(useResumeData
        ? "Resume data looks too thin — add some experience/projects/skills first, or switch to manual entry."
        : "Tell us a bit more about your background (skills, projects, experience).");
      setGenStatus("error");
      setTimeout(() => setGenStatus("idle"), 2400);
      return;
    }
    if (!companyName.trim()) {
      setGenError("Enter the company name.");
      setGenStatus("error");
      setTimeout(() => setGenStatus("idle"), 2400);
      return;
    }
    if (!jobDescription || jobDescription.trim().length < 20) {
      setGenError("Paste the job description first.");
      setGenStatus("error");
      setTimeout(() => setGenStatus("idle"), 2400);
      return;
    }

    setGenStatus("loading");
    try {
      const res = await fetch("http://localhost:3001/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ background: effectiveBackground, jobTitle, companyName, jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      setLetter(data.letter);
      setGenStatus("done");
      setTimeout(() => setGenStatus("idle"), 2200);
    } catch (e) {
      console.error("Cover letter generation failed:", e);
      setGenError(e.message || "Something went wrong. Try again.");
      setGenStatus("error");
      setTimeout(() => setGenStatus("idle"), 2600);
    }
  }

  async function handleDownload() {
    if (dlStatus === "loading" || !letter) return;
    setDlStatus("loading");
    try {
      await generateCoverLetterPDF({ name, email, phone, companyName, jobTitle, letter });
      setDlStatus("done");
      setTimeout(() => setDlStatus("idle"), 2400);
    } catch (e) {
      console.error("PDF generation failed:", e);
      setDlStatus("error");
      setTimeout(() => setDlStatus("idle"), 2400);
    }
  }

  function handleCopy() {
    if (!letter) return;
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <style>{`
        @keyframes rf-bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(3px); } }
        .group:hover .rf-bob-trigger .rf-arrow { animation: rf-bob 0.7s ease-in-out infinite; }
        @keyframes rf-sweep { 0% { transform: translateX(-110%); } 100% { transform: translateX(310%); } }
        .rf-sweep { animation: rf-sweep 0.9s ease-in-out infinite; }
        @keyframes rf-dot-fall { 0%, 100% { transform: translateY(0px); opacity: 0.4; } 50% { transform: translateY(4px); opacity: 1; } }
        .rf-dot { animation: rf-dot-fall 0.8s ease-in-out infinite; }
        @keyframes rf-pop { 0% { transform: scale(0.3) rotate(-20deg); opacity: 0; } 60% { transform: scale(1.25) rotate(6deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .rf-pop { animation: rf-pop 0.45s cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes rf-burst { 0% { transform: translate(0,0) scale(1); opacity: 1; } 100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; } }
        .rf-burst { animation: rf-burst 0.55s ease-out forwards; }
        @keyframes rf-shake { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-4px); } 40% { transform: translateX(4px); } 60% { transform: translateX(-3px); } 80% { transform: translateX(3px); } }
        .rf-shake { animation: rf-shake 0.4s ease-in-out; }
        @keyframes rf-fade-up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .rf-fade-up { animation: rf-fade-up 0.35s ease-out both; }
      `}</style>

      <Navbar />

      <div className="max-w-3xl mx-auto px-5 sm:px-6 pt-28 pb-20">
        <h1 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[32px] sm:text-[38px] text-[#0a1628] leading-tight mb-2">
          Write your cover letter
        </h1>
        <p className="text-[14px] text-[#4a6fa5] mb-10">
          Paste the job description, tell us a bit about yourself, and AI will draft a letter tailored to the role — in your own facts, no invented numbers.
        </p>

        {!isPremium ? (
          <div className="rounded-3xl border border-[#cbd5e1]/60 bg-white p-10 text-center shadow-[0_4px_16px_-4px_rgba(10,22,40,0.10),0_1px_3px_rgba(10,22,40,0.06)]">
            <div className="w-12 h-12 rounded-2xl bg-[#d1fae5] flex items-center justify-center mx-auto mb-4">
              <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.6l1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.4l-3.8 2 .7-4.3-3.1-3 4.3-.6L8 1.6z" stroke="#059669" strokeWidth="1.3" strokeLinejoin="round" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'DM Serif Display', serif" }} className="text-[22px] text-[#0a1628] mb-2">
              Cover Letter Generator is a premium feature
            </h2>
            <p className="text-[13px] text-[#4a6fa5] mb-6 max-w-sm mx-auto">
              Unlock it with any pass — Sprint, Placement, or Season — or grab it as a one-time add-on.
            </p>
            <button
              onClick={() => setUpgradeOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0a1628] text-white text-[13px] font-semibold hover:bg-[#059669] transition-colors duration-200"
            >
              Unlock Cover Letter Generator
            </button>
          </div>
        ) : (
          <div className="space-y-6">

            {/* Background source toggle */}
            <div className="rounded-3xl border border-[#cbd5e1]/60 bg-white p-6 shadow-[0_4px_16px_-4px_rgba(10,22,40,0.10),0_1px_3px_rgba(10,22,40,0.06)]">
              {hasResumeData ? (
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <p className={labelClass}>Background source</p>
                    <p className="text-[13px] text-[#0a1628]">
                      {useResumeData
                        ? "Using details from your saved resume (education, experience, projects, skills)."
                        : "Using the background you type below."}
                    </p>
                  </div>
                  <button
                    onClick={() => setUseResumeData((v) => !v)}
                    className="shrink-0 text-[12px] font-semibold text-[#059669] hover:text-[#047857] transition-colors px-3 py-1.5 rounded-full border border-[#059669]/30 hover:bg-[#d1fae5]/40"
                  >
                    {useResumeData ? "Enter manually instead" : "Use my resume instead"}
                  </button>
                </div>
              ) : (
                <p className="text-[13px] text-[#4a6fa5]">
                  We didn't find a saved resume — just tell us a bit about your background below.
                </p>
              )}

              {!useResumeData && (
                <div className="mt-4">
                  <label className={labelClass}>Your background</label>
                  <textarea
                    value={manualBackground}
                    onChange={(e) => setManualBackground(e.target.value)}
                    rows={5}
                    placeholder="E.g. B.Tech CSE student, skilled in React, Node.js, MySQL. Built a 3-project portfolio including an e-commerce app with Razorpay integration. Interned at..."
                    className={inputClass}
                  />
                </div>
              )}
            </div>

            {/* Contact details */}
            <div className="rounded-3xl border border-[#cbd5e1]/60 bg-white p-6 shadow-[0_4px_16px_-4px_rgba(10,22,40,0.10),0_1px_3px_rgba(10,22,40,0.06)]">
              <p className={labelClass}>Contact details (for the letter header)</p>
              <div className="grid sm:grid-cols-3 gap-3">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className={inputClass} />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={inputClass} />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (optional)" className={inputClass} />
              </div>
            </div>

            {/* Job details */}
            <div className="rounded-3xl border border-[#cbd5e1]/60 bg-white p-6 shadow-[0_4px_16px_-4px_rgba(10,22,40,0.10),0_1px_3px_rgba(10,22,40,0.06)]">
              <div className="grid sm:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className={labelClass}>Company name</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. TCS" className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Job title (optional)</label>
                  <input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" className={inputClass} />
                </div>
              </div>
              <label className={labelClass}>Job description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                rows={7}
                placeholder="Paste the full job description here…"
                className={inputClass}
              />
            </div>

            {genError && genStatus === "error" && (
              <p className="text-[13px] text-red-600 -mt-2 px-1">{genError}</p>
            )}

            <div className="flex justify-end">
              <AliveActionButton
                status={genStatus}
                onClick={handleGenerate}
                idleLabel="Generate Letter"
                loadingLabel="Writing…"
                doneLabel="Generated"
                errorLabel="Try again"
                idleIconPath="M2 8h8M10 8l-3-3M10 8l-3 3M2 3h3M2 13h3"
              />
            </div>

            {/* Result */}
            {letter && (
              <div className="rounded-3xl border border-[#cbd5e1]/60 bg-white p-6 shadow-[0_4px_16px_-4px_rgba(10,22,40,0.10),0_1px_3px_rgba(10,22,40,0.06)] rf-fade-up">
                <div className="flex items-center justify-between mb-3">
                  <p className={labelClass + " mb-0"}>Your cover letter (editable)</p>
                  <button
                    onClick={handleCopy}
                    className="text-[12px] font-semibold text-[#4a6fa5] hover:text-[#0a1628] transition-colors"
                  >
                    {copied ? "Copied ✓" : "Copy text"}
                  </button>
                </div>
                <textarea
                  value={letter}
                  onChange={(e) => setLetter(e.target.value)}
                  rows={14}
                  className={inputClass + " font-[Inter] leading-relaxed"}
                />
                <div className="flex items-center justify-end gap-3 mt-4">
                  <AliveActionButton
                    status={genStatus === "loading" ? "idle" : genStatus}
                    onClick={handleGenerate}
                    idleLabel="Regenerate"
                    loadingLabel="Writing…"
                    doneLabel="Generated"
                    errorLabel="Try again"
                    idleIconPath="M2 3v4h4M14 13V9h-4M3.5 6A5.5 5.5 0 0113 5.2M12.5 10A5.5 5.5 0 013 10.8"
                  />
                  <AliveActionButton
                    status={dlStatus}
                    onClick={handleDownload}
                    idleLabel="Download PDF"
                    loadingLabel="Generating…"
                    doneLabel="Downloaded"
                    errorLabel="Try again"
                    idleIconPath="M8 1.5v8M4.5 6.5L8 10l3.5-3.5M2 13.5h12"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  );
}