import { useState } from "react";

const ACCEPTED_FILE_TYPES = ".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function formatFileSize(bytes) {
  if (!bytes) return "0 KB";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadIcon({ loading = false }) {
  if (loading) {
    return (
      <svg className="h-7 w-7 animate-spin text-iris-violet" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" opacity="0.2" />
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className="h-7 w-7 text-iris-violet transition-transform duration-300 ease-overshoot group-hover:-translate-y-1" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 14.5v3.2A2.3 2.3 0 0 0 7.3 20h9.4a2.3 2.3 0 0 0 2.3-2.3v-3.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function ResumeUploadZone({ file, status, error, onFileSelected, onReset }) {
  const [isDragActive, setIsDragActive] = useState(false);
  const isReading = status === "reading";
  const isError = status === "error";

  function handleFiles(fileList) {
    const nextFile = fileList?.[0];
    if (nextFile) onFileSelected(nextFile);
  }

  function handleDrop(event) {
    event.preventDefault();
    setIsDragActive(false);
    if (!isReading) handleFiles(event.dataTransfer.files);
  }

  function handleKeyDown(event) {
    if ((event.key === "Enter" || event.key === " ") && !isReading) {
      event.preventDefault();
      event.currentTarget.querySelector("input")?.click();
    }
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="resume-file-input"
        tabIndex={isReading ? -1 : 0}
        onDragEnter={(event) => { event.preventDefault(); if (!isReading) setIsDragActive(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragActive(false);
        }}
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        className={`group relative flex min-h-[13rem] cursor-pointer flex-col items-center justify-center overflow-hidden border border-dashed px-6 py-8 text-center transition-all duration-200 ease-overshoot rounded-cards focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-iris-violet ${
          isDragActive
            ? "-translate-y-1 border-violet-wash-border bg-violet-wash"
            : isError
              ? "border-error-border bg-error-bg hover:border-error-text"
              : "border-mist bg-soft-snow hover:-translate-y-0.5 hover:border-deep-iris hover:bg-violet-wash"
        } ${isReading ? "cursor-wait" : ""}`}
      >
        <input
          id="resume-file-input"
          type="file"
          accept={ACCEPTED_FILE_TYPES}
          onChange={(event) => {
            handleFiles(event.target.files);
            event.target.value = "";
          }}
          disabled={isReading}
          className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        />

        <span className={`mb-4 flex h-14 w-14 items-center justify-center rounded-tags border transition-all duration-300 ease-overshoot ${
          isDragActive ? "scale-110 border-iris-violet bg-violet-wash" : "border-violet-wash-border bg-violet-wash"
        }`}>
          <UploadIcon loading={isReading} />
        </span>

        {isReading ? (
          <>
            <span className="font-heading text-[20px] text-graphite-ink">Reading your resume</span>
            <span className="mt-2 font-body text-[14px] text-ash">Everything is processed in your browser.</span>
            <span className="mt-4 flex items-center gap-1.5" aria-label="Reading in progress">
              {[0, 1, 2].map((index) => (
                <span key={index} className="rf-dot h-1.5 w-1.5 rounded-full bg-iris-violet" style={{ animationDelay: `${index * 120}ms` }} />
              ))}
            </span>
          </>
        ) : file ? (
          <>
            <span className="max-w-full truncate font-heading text-[20px] text-graphite-ink">{file.name}</span>
            <span className="mt-2 font-body text-[14px] text-ash">{formatFileSize(file.size)} · ready to scan</span>
            <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-success-text">Text extracted privately</span>
          </>
        ) : (
          <>
            <span className="font-heading text-[20px] text-graphite-ink">Drop your resume here</span>
            <span className="mt-2 font-body text-[14px] text-ash">or choose a PDF or DOCX file</span>
            <span className="mt-4 font-mono text-[9px] uppercase tracking-[0.16em] text-fog">Up to 10 MB · processed in your browser</span>
          </>
        )}
      </label>

      {isError && error && (
        <div className="flex items-start justify-between gap-4 border border-error-border bg-error-bg px-4 py-3 rounded-cards" role="alert">
          <p className="font-body text-[13px] leading-relaxed text-error-text">{error}</p>
          <button
            type="button"
            onClick={onReset}
            className="shrink-0 border border-error-text/35 px-3 py-1.5 font-body text-[12px] font-semibold text-error-text transition-all duration-200 hover:-translate-y-0.5 hover:bg-error-text hover:text-white active:scale-[0.97] rounded-buttons"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
