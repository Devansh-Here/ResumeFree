import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function generateCoverLetterPDF({
  letter,
  name,
  email,
  phone,
  companyName,
  jobTitle,
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 56;
  const maxWidth = width - margin * 2;
  let cursorY = height - margin;

  const ink = rgb(0.039, 0.086, 0.157); // #0a1628
  const ash = rgb(0.118, 0.227, 0.373); // #1e3a5f

  // Word-wrap helper
  const wrapText = (text, font, size, maxW) => {
    const words = text.split(/\s+/);
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, size) > maxW) {
        if (line) lines.push(line);
        line = word;
      } else {
        line = test;
      }
    }
    if (line) lines.push(line);
    return lines;
  };

  const drawLine = (text, font, size, color, gap = size * 1.4) => {
    page.drawText(text, { x: margin, y: cursorY, size, font, color });
    cursorY -= gap;
  };

  // --- Header: Name + contact ---
  drawLine(name || 'Your Name', fontBold, 16, ink, 20);
  const contactLine = [email, phone].filter(Boolean).join('  |  ');
  if (contactLine) drawLine(contactLine, fontRegular, 10, ash, 24);

  // --- Date ---
  const today = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  drawLine(today, fontRegular, 10, ash, 22);

  // --- Recipient ---
  drawLine('Hiring Manager', fontRegular, 10, ash, 14);
  if (companyName) drawLine(companyName, fontRegular, 10, ash, 14);
  if (jobTitle) drawLine(`Re: Application for ${jobTitle}`, fontRegular, 10, ash, 24);
  else cursorY -= 10;

  // --- Greeting ---
  drawLine('Dear Hiring Manager,', fontRegular, 11, ink, 22);

  // --- Body (word-wrapped paragraphs) ---
  const paragraphs = letter.split(/\n+/).filter((p) => p.trim().length > 0);
  const bodySize = 11;

  for (const para of paragraphs) {
    const lines = wrapText(para.trim(), fontRegular, bodySize, maxWidth);
    for (const line of lines) {
      if (cursorY < margin + 60) {
        // safety: avoid overflow off page (rare for ~300 word letters)
        break;
      }
      drawLine(line, fontRegular, bodySize, ink, bodySize * 1.5);
    }
    cursorY -= 6; // paragraph spacing
  }

  // --- Sign-off ---
  cursorY -= 10;
  drawLine('Sincerely,', fontRegular, 11, ink, 28);
  drawLine(name || 'Your Name', fontBold, 11, ink, 14);

  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `Cover_Letter_${(companyName || 'Application').replace(/\s+/g, '_')}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default generateCoverLetterPDF;