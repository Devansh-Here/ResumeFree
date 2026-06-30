// src/pages/PrivacyPage.jsx
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const LAST_UPDATED = "June 17, 2026";

const sections = [
  {
    id: "overview",
    label: "01",
    title: "Overview",
    content: [
      {
        type: "p",
        text: "ResumeFree is a free, browser-based resume builder. We built it with a simple rule: your data belongs to you. This policy explains exactly what we collect, why, and what we never do.",
      },
      {
        type: "p",
        text: "If anything here is unclear, email us at privacy@resumefree.app — we'll respond in plain English.",
      },
    ],
  },
  {
    id: "what-we-collect",
    label: "02",
    title: "What we collect",
    content: [
      {
        type: "subsection",
        heading: "Resume data (stored locally)",
        text: "Everything you type into the builder — your name, contact details, education, experience, skills, and projects — is saved in your browser's local storage. It never leaves your device unless you explicitly download or export it.",
      },
      {
        type: "subsection",
        heading: "AI improvement requests",
        text: "When you click 'Improve with AI', the specific bullet point text you submit is sent to Groq's API for processing. We do not attach any personally identifying information to these requests. Groq's own privacy policy governs how they handle this data.",
      },
      {
        type: "subsection",
        heading: "Basic analytics (if enabled)",
        text: "We may collect anonymised page-view counts and feature usage metrics to understand how the product is used. This data contains no personally identifiable information and is never sold.",
      },
    ],
  },
  {
    id: "what-we-dont",
    label: "03",
    title: "What we never do",
    content: [
      {
        type: "list",
        items: [
          "Sell, rent, or share your data with advertisers",
          "Store your resume on our servers without your consent",
          "Use your resume content to train AI models",
          "Send you marketing emails without explicit opt-in",
          "Require an account to use core features",
        ],
      },
    ],
  },
  {
    id: "third-parties",
    label: "04",
    title: "Third-party services",
    content: [
      {
        type: "table",
        rows: [
          {
            service: "Groq API",
            purpose: "AI bullet-point improvement",
            dataShared: "Bullet text only",
            link: "https://groq.com/privacy",
          },
          {
            service: "Vercel",
            purpose: "Hosting & serverless functions",
            dataShared: "Request logs (IP, timestamp)",
            link: "https://vercel.com/legal/privacy-policy",
          },
          {
            service: "Razorpay",
            purpose: "Premium payments",
            dataShared: "Payment details only",
            link: "https://razorpay.com/privacy",
          },
          {
            service: "Supabase",
            purpose: "Account & cloud resume storage",
            dataShared: "Email, saved resume data",
            link: "https://supabase.com/privacy",
          },
        ],
      },
      {
        type: "p",
        text: "We only integrate services we've reviewed. Each third party is contractually bound to their own privacy policies linked above.",
      },
    ],
  },
  {
    id: "cookies",
    label: "05",
    title: "Cookies & storage",
    content: [
      {
        type: "p",
        text: "ResumeFree uses browser localStorage to persist your resume between sessions. We do not use tracking cookies. If we add analytics, it will use privacy-respecting, cookieless methods.",
      },
      {
        type: "p",
        text: "You can clear all stored resume data at any time by clearing your browser's local storage for this site, or using the 'Clear resume' option in the builder.",
      },
    ],
  },
  {
    id: "your-rights",
    label: "06",
    title: "Your rights",
    content: [
      {
        type: "p",
        text: "Since your data lives in your own browser, you have full control at all times. You can view, edit, or delete it without contacting us.",
      },
      {
        type: "list",
        items: [
          "Access: your data is in your browser's DevTools → Application → Local Storage",
          "Deletion: clear site data in your browser settings",
          "Portability: download your resume as PDF at any time",
          "Objection: contact us to opt out of any analytics",
        ],
      },
    ],
  },
  {
    id: "contact",
    label: "07",
    title: "Contact",
    content: [
      {
        type: "p",
        text: "Questions, concerns, or requests? Reach us at:",
      },
      {
        type: "contact",
        email: "privacy@resumefree.app",
      },
    ],
  },
];

function ContentBlock({ block }) {
  switch (block.type) {
    case "p":
      return (
        <p className="text-[15.5px] leading-relaxed text-[#1e3a5f]">
          {block.text}
        </p>
      );

    case "subsection":
      return (
        <div className="space-y-1.5">
          <h4 className="font-semibold text-[13px] tracking-wide text-[#059669]">
            {block.heading}
          </h4>
          <p className="text-[15.5px] leading-relaxed text-[#1e3a5f]">
            {block.text}
          </p>
        </div>
      );

    case "list":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-[#059669]" />
              <span className="text-[15.5px] leading-relaxed text-[#1e3a5f]">
                {item}
              </span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[520px]">
            <thead>
              <tr className="border-b-2 border-[#0a1628]">
                {["Service", "Purpose", "Data shared", "Policy"].map((h) => (
                  <th
                    key={h}
                    className="pb-2.5 pr-4 text-left font-semibold text-[11px] tracking-widest uppercase text-[#4a6fa5]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i} className="border-b border-[#cbd5e1]">
                  <td className="py-3.5 pr-4 font-medium text-[#0a1628]">
                    {row.service}
                  </td>
                  <td className="py-3.5 pr-4 text-[#1e3a5f]/80">
                    {row.purpose}
                  </td>
                  <td className="py-3.5 pr-4 text-[#1e3a5f]/80">
                    {row.dataShared}
                  </td>
                  <td className="py-3.5">
                    
                      <a href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline underline-offset-2 text-[#059669] hover:text-[#0a1628] transition-colors"
                    >
                      View →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case "contact":
      return (
        
          <a href={`mailto:${block.email}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium bg-[#0a1628] text-white hover:bg-[#1e3a5f] transition-colors"
        >
          <span>✉</span>
          {block.email}
        </a>
      );

    default:
      return null;
  }
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sohne">
      <Navbar />

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-[120px] sm:pt-[136px] pb-10">
        <span className="text-[11px] font-semibold tracking-widest uppercase block mb-4 text-[#059669]">
          Legal · Privacy Policy
        </span>
        <h1
          className="text-[2.75rem] sm:text-[3.25rem] leading-[1.08] mb-4 text-[#0a1628]"
          style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}
        >
          Your data,
          <br />
          your rules.
        </h1>
        <p className="text-[17px] leading-relaxed max-w-xl text-[#1e3a5f]">
          We keep this simple: ResumeFree works in your browser. No hidden
          servers, no data harvesting, no ads. Here's the full picture.
        </p>
        <div className="mt-8 h-[3px] w-16 rounded-full bg-[#059669]" />
        <p className="mt-6 text-xs text-[#4a6fa5]">Last updated {LAST_UPDATED}</p>
      </header>

      {/* Table of contents */}
      <div className="max-w-3xl mx-auto px-6 mb-10">
        <div
          className="flex gap-2.5 overflow-x-auto pb-2 sm:flex-wrap"
          style={{ scrollbarWidth: "none" }}
        >
          {sections.map((s) => (
            
              <a key={s.id}
              href={`#${s.id}`}
              className="flex-shrink-0 text-[12.5px] font-medium px-3.5 py-1.5 rounded-full border border-[#cbd5e1] text-[#1e3a5f] hover:border-[#059669] hover:text-[#059669] transition-colors"
            >
              {s.label} · {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-6 pb-24">
        {sections.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className={`py-10 ${idx === 0 ? "" : "border-t border-[#cbd5e1]/70"}`}
          >
            <div className="flex items-start gap-6">
              <span className="hidden sm:block text-xs pt-1.5 flex-shrink-0 w-8 text-[#4a6fa5]/60 font-medium">
                {section.label}
              </span>

              <div className="flex-1 space-y-5">
                <h2
                  className="text-[22px] text-[#0a1628]"
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                >
                  {section.title}
                </h2>
                {section.content.map((block, i) => (
                  <ContentBlock key={i} block={block} />
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>

      <Footer />
    </div>
  );
}