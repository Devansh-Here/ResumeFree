// src/utils/generatePDF.js
export default async function generatePDF(resume, templateId) {
  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume, templateId }),
  });

  if (!response.ok) {
    let message = "PDF generation failed";
    try {
      const data = await response.json();
      message = data.error || message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const rawName = resume?.personal?.name?.trim();
  const fileName = rawName
    ? `${rawName.replace(/[^a-zA-Z0-9]+/g, "_")}_Resume.pdf`
    : "resume.pdf";

  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}