// api/generate-pdf.js
import React from "react";
import ReactDOMServer from "react-dom/server";
import { getTemplate } from "../src/components/templates/templateRegistry.js";

export const config = {
  api: {
    bodyParser: true,
  },
};

async function getBrowser() {
  const isProd =
    process.env.VERCEL_ENV === "production" ||
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL === "1";

  if (isProd) {
    const chromium = (await import("@sparticuz/chromium")).default;
    const puppeteerCore = (await import("puppeteer-core")).default;
    const executablePath = await chromium.executablePath();
    return puppeteerCore.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath,
      headless: chromium.headless,
    });
  }

  const puppeteer = (await import("puppeteer")).default;
  return puppeteer.launch({ headless: "new" });
}

function buildHtml(bodyHtml) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<style>
  html, body { margin: 0; padding: 0; background: #ffffff; }
  @page { margin: 0; size: A4; }
</style>
</head>
<body>
  <div id="resume-root">${bodyHtml}</div>
</body>
</html>`;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let browser;
  try {
    const { resume, templateId } = req.body || {};
    if (!resume || !templateId) {
      res.status(400).json({ error: "Missing resume or templateId" });
      return;
    }

    const { component: TemplateComponent } = getTemplate(templateId);
    if (!TemplateComponent) {
      res.status(400).json({ error: "Unknown templateId" });
      return;
    }

    const bodyHtml = ReactDOMServer.renderToStaticMarkup(
      React.createElement(TemplateComponent, { resume })
    );
    const fullHtml = buildHtml(bodyHtml);

    browser = await getBrowser();
    const page = await browser.newPage();
    await page.setContent(fullHtml, { waitUntil: "networkidle0" });
    await page.evaluate(() => document.fonts.ready);

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", 'attachment; filename="resume.pdf"');
    res.status(200).send(pdfBuffer);
  } catch (err) {
    console.error("PDF generation failed:", err);
    res
      .status(500)
      .json({ error: "PDF generation failed", detail: err.message });
  } finally {
    if (browser) await browser.close();
  }
}