// src/utils/extractResumeText.js
//
// Client-side text extraction for uploaded resumes (PDF or DOCX).
// Runs entirely in the browser — the file never leaves the user's device.
// This matches ResumeFree's existing "no server cost, no privacy risk"
// philosophy already used for localStorage-based resume auto-save.
//
// Usage:
//   const { text, warning } = await extractResumeText(file);

import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// pdf.js needs its worker script. Using the CDN build keeps this simple and
// avoids fighting Vite's bundler over worker file paths. Version must match
// the installed pdfjs-dist version — check package.json after `npm install`
// and update this if it ever drifts.
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const MAX_FILE_SIZE_MB = 10;

export class ResumeExtractionError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ResumeExtractionError';
  }
}

function getFileExtension(file) {
  const name = file.name || '';
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

async function extractFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    // pdf.js returns individual text fragments with position data. Joining
    // with spaces is good enough for keyword-matching purposes — we don't
    // need to reconstruct exact line breaks or layout.
    const pageText = content.items.map((item) => item.str).join(' ');
    fullText += pageText + '\n';
  }

  return fullText.trim();
}

async function extractFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || '').trim();
}

/**
 * Extract plain text from an uploaded resume file (PDF or DOCX).
 *
 * @param {File} file - The uploaded file object.
 * @returns {Promise<{ text: string, warning: string|null }>}
 * @throws {ResumeExtractionError} if the file type is unsupported, too
 *         large, or extraction yields no usable text (e.g. a scanned/
 *         image-only PDF with no embedded text layer).
 */
export async function extractResumeText(file) {
  if (!file) {
    throw new ResumeExtractionError('No file provided.');
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > MAX_FILE_SIZE_MB) {
    throw new ResumeExtractionError(
      `File is too large (${sizeMB.toFixed(1)}MB). Please upload a file under ${MAX_FILE_SIZE_MB}MB.`
    );
  }

  const ext = getFileExtension(file);
  let text = '';

  try {
    if (ext === 'pdf' || file.type === 'application/pdf') {
      text = await extractFromPDF(file);
    } else if (
      ext === 'docx' ||
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      text = await extractFromDOCX(file);
    } else if (ext === 'doc' || file.type === 'application/msword') {
      // Legacy .doc (pre-2007 binary format) is not supported by mammoth.
      // Detecting it explicitly gives a much clearer error than a generic
      // parsing failure would.
      throw new ResumeExtractionError(
        'Old .doc files are not supported. Please save your resume as .docx or .pdf and try again.'
      );
    } else {
      throw new ResumeExtractionError(
        'Unsupported file type. Please upload a PDF or DOCX file.'
      );
    }
  } catch (err) {
    if (err instanceof ResumeExtractionError) throw err;
    throw new ResumeExtractionError(
      'Could not read this file. It may be corrupted or in an unexpected format.'
    );
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;

  if (wordCount < 15) {
    // Most likely a scanned/image-only PDF with no embedded text layer, or
    // an otherwise near-empty document. We deliberately do NOT attempt OCR
    // here — that would need a server round-trip and defeats the
    // zero-cost, client-side, privacy-friendly design of this feature.
    throw new ResumeExtractionError(
      "We couldn't find readable text in this file. If it's a scanned image or photo of your resume, please upload a text-based PDF or DOCX instead."
    );
  }

  let warning = null;
  if (wordCount < 60) {
    // Extraction technically succeeded but the result looks thin — could
    // be a resume that's mostly graphics/icons/tables that don't extract
    // cleanly. Surface this as a non-blocking warning rather than an error.
    warning =
      'This resume seems to have very little extractable text — some sections may not have been read correctly. Results below may be incomplete.';
  }

  return { text, warning };
}