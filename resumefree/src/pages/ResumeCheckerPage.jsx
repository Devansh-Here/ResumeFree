import { useState } from "react";
import { useAuthStore } from "../store/authStore";
import UpgradeModal from "../components/premium/UpgradeModal";
import Footer from "../components/layout/Footer";
import Navbar from "../components/layout/Navbar";
import CheckerResultsPanel from "../components/resumeChecker/CheckerResultsPanel";
import ResumeUploadZone from "../components/resumeChecker/ResumeUploadZone";
import RoleSelector from "../components/resumeChecker/RoleSelector";
import { extractResumeText, ResumeExtractionError } from "../utils/extractResumeText";
import { scoreText } from "../utils/atsCheck";
import { supabase } from "../utils/supabaseClient";

const MIN_JD_LENGTH = 20;
const MAX_JD_LENGTH = 8000;
const MAX_RESUME_TEXT_FOR_MATCH = 16000;

function normalizeText(value, maxLength) {
  return String(value || "").split(String.fromCharCode(0)).join(" ").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

export default function ResumeCheckerPage() {
  const hasJdAccess = useAuthStore((state) => state.hasJDMatcherAccess());
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [extractionWarning, setExtractionWarning] = useState(null);
  const [result, setResult] = useState(null);
  const [roleOverride, setRoleOverride] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);
  const [jd, setJd] = useState("");
  const [jdState, setJdState] = useState("idle");
  const [jdResult, setJdResult] = useState(null);
  const [jdError, setJdError] = useState(null);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  async function handleFileSelected(nextFile) {
    setFile(nextFile);
    setExtractedText("");
    setExtractionWarning(null);
    setResult(null);
    setError(null);
    setJd("");
    setJdState("idle");
    setJdResult(null);
    setJdError(null);
    setStatus("reading");

    try {
      const extraction = await extractResumeText(nextFile);
      const text = normalizeText(extraction.text, Number.MAX_SAFE_INTEGER);
      setExtractedText(text);
      setExtractionWarning(extraction.warning);
      setResult(scoreText(text, roleOverride));
      setStatus("ready");
    } catch (extractionError) {
      const message = extractionError instanceof ResumeExtractionError
        ? extractionError.message
        : "We could not read this file. Please try another PDF or DOCX.";
      setError(message);
      setStatus("error");
    }
  }

  function handleRoleChange(nextRole) {
    setRoleOverride(nextRole);
    if (extractedText) setResult(scoreText(extractedText, nextRole));
  }

  function handleReset() {
    setFile(null);
    setExtractedText("");
    setExtractionWarning(null);
    setResult(null);
    setError(null);
    setStatus("idle");
    setJd("");
    setJdState("idle");
    setJdResult(null);
    setJdError(null);
  }

  function handleScanAnother() {
    handleReset();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAnalyzeJd() {
    const cleanJd = normalizeText(jd, MAX_JD_LENGTH);
    if (cleanJd.length < MIN_JD_LENGTH) {
      setJdError("Paste the full job description so we can compare meaningful keywords.");
      return;
    }
    if (!extractedText) {
      setJdError("Scan your resume first, then add a job description.");
      return;
    }

    setJd(cleanJd);
    setJdError(null);
    setJdResult(null);
    setJdState("loading");

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error("Sign in with an eligible pass or JD Tailoring add-on to use this report.");
      }

      const response = await fetch("/api/jd-match", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          bullets: [{ label: "Uploaded resume", text: extractedText.slice(0, MAX_RESUME_TEXT_FOR_MATCH) }],
          skills: [],
          jobDescription: cleanJd,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "We could not analyze this job description. Please try again.");
      setJdResult(data);
      setJdState("done");
    } catch (requestError) {
      setJdError(requestError.message || "The job match could not be completed. Please try again.");
      setJdState("error");
    }
  }

  function handleResetJd() {
    setJdResult(null);
    setJdError(null);
    setJdState("idle");
  }

  async function handleCopy(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return (
    <div className="min-h-screen bg-paper-white text-graphite-ink">
      <Navbar />
      <main>
        <section className="relative overflow-hidden border-b border-mist bg-soft-snow">
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-violet-wash blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-violet-wash blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-5 pb-12 pt-28 sm:px-8 sm:pb-16 sm:pt-36">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-iris-violet">Resume optimizer</p>
              <h1 className="mt-4 font-heading text-[36px] leading-tight text-graphite-ink sm:text-[52px]">Check the resume you already have.</h1>
              <p className="mt-5 max-w-2xl font-body text-[16px] leading-relaxed text-ash sm:text-[18px]">Upload a text-based PDF or DOCX and get a private ATS keyword report without rebuilding everything from scratch.</p>
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 font-body text-[12px] text-fog">
                <span>Browser-processed</span>
                <span>•</span>
                <span>No signup required</span>
                <span>•</span>
                <span>PDF / DOCX</span>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start">
          <div className="space-y-6">
            <div className="border border-mist bg-paper-white p-5 sm:p-6 rounded-cards">
              <div className="mb-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog">Step 01 · Upload</p>
                <h2 className="mt-2 font-heading text-[20px] text-graphite-ink">Start with your current file</h2>
              </div>
              <ResumeUploadZone file={file} status={status} error={error} onFileSelected={handleFileSelected} onReset={handleReset} />
            </div>

            <div className="border border-mist bg-paper-white p-5 sm:p-6 rounded-cards">
              <div className="mb-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-fog">Step 02 · Focus</p>
                <h2 className="mt-2 font-heading text-[20px] text-graphite-ink">Tell the scanner what you are targeting</h2>
              </div>
              <RoleSelector value={roleOverride} onChange={handleRoleChange} disabled={!file || status === "reading"} />
            </div>

            <div className="border border-info-border bg-info-bg p-5 rounded-cards">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-info-text">Privacy note</p>
              <p className="mt-2 font-body text-[13px] leading-relaxed text-info-text">Your uploaded file is parsed in this browser and is not stored in ResumeFree. Only the text needed for an optional JD match is sent to the existing matching endpoint.</p>
            </div>
          </div>

          <div className="min-h-[16rem]">
            {!result ? (
              <div className="flex min-h-[16rem] flex-col items-center justify-center border border-dashed border-mist bg-soft-snow px-6 py-12 text-center rounded-cards">
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-fog">Step 03 · Report</span>
                <h2 className="mt-3 font-heading text-[24px] text-graphite-ink">Your report will appear here</h2>
                <p className="mt-3 max-w-sm font-body text-[14px] leading-relaxed text-ash">Upload a resume to reveal your ATS foundation, role-specific keyword coverage, and next steps.</p>
              </div>
            ) : (
              <CheckerResultsPanel
                result={result}
                extractionWarning={extractionWarning}
                jd={jd}
                setJd={setJd}
                jdState={jdState}
                jdResult={jdResult}
                jdError={jdError}
                onAnalyzeJd={handleAnalyzeJd}
                onResetJd={handleResetJd}
                onCopy={handleCopy}
                hasJdAccess={hasJdAccess}
                onUpgrade={() => setUpgradeOpen(true)}
                onScanAnother={handleScanAnother}
              />
            )}
          </div>
        </section>
      </main>
      <Footer attachedTop />
      {upgradeOpen && <UpgradeModal onClose={() => setUpgradeOpen(false)} />}
    </div>
  );
}
