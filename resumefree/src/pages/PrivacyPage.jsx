// src/pages/PrivacyPage.jsx
import { Link } from "react-router-dom";

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
            purpose: "Premium payments (coming soon)",
            dataShared: "Payment details only",
            link: "https://razorpay.com/privacy",
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
        <p className="text-base leading-relaxed" style={{ color: "#161A2E", opacity: 0.8 }}>
          {block.text}
        </p>
      );

    case "subsection":
      return (
        <div className="space-y-1.5">
          <h4
            className="font-semibold text-sm tracking-wide"
            style={{ fontFamily: "'IBM Plex Mono', monospace", color: "#1E8E5A" }}
          >
            {block.heading}
          </h4>
          <p className="text-base leading-relaxed" style={{ color: "#161A2E", opacity: 0.8 }}>
            {block.text}
          </p>
        </div>
      );

    case "list":
      return (
        <ul className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#E2A33B" }}
              />
              <span className="text-base leading-relaxed" style={{ color: "#161A2E", opacity: 0.8 }}>
                {item}
              </span>
            </li>
          ))}
        </ul>
      );

    case "table":
      return (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr style={{ borderBottom: "2px solid #161A2E" }}>
                {["Service", "Purpose", "Data shared", "Policy"].map((h) => (
                  <th
                    key={h}
                    className="pb-2 pr-4 text-left font-medium"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      color: "#161A2E",
                      fontSize: "0.75rem",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: "1px solid #DDD6C8" }}
                >
                  <td className="py-3 pr-4 font-medium" style={{ color: "#161A2E" }}>
                    {row.service}
                  </td>
                  <td className="py-3 pr-4" style={{ color: "#161A2E", opacity: 0.75 }}>
                    {row.purpose}
                  </td>
                  <td className="py-3 pr-4" style={{ color: "#161A2E", opacity: 0.75 }}>
                    {row.dataShared}
                  </td>
                  <td className="py-3">
                    <a
                      href={row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline underline-offset-2"
                      style={{ color: "#1E8E5A" }}
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
        <a
          href={`mailto:${block.email}`}
          className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
          style={{
            background: "#161A2E",
            color: "#F6F4EF",
            fontFamily: "'IBM Plex Mono', monospace",
          }}
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
    <div
      className="min-h-screen"
      style={{ background: "#F6F4EF", fontFamily: "'Inter', sans-serif" }}
    >
      {/* Nav strip */}
      <nav
        className="sticky top-0 z-10 px-6 py-4 flex items-center justify-between"
        style={{
          background: "#F6F4EF",
          borderBottom: "1px solid #DDD6C8",
          backdropFilter: "blur(8px)",
        }}
      >
        <Link
          to="/"
          className="text-sm font-medium flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          style={{ color: "#161A2E", fontFamily: "'IBM Plex Mono', monospace" }}
        >
          ← Back to ResumeFree
        </Link>
        <span
          className="text-xs hidden sm:block"
          style={{
            color: "#161A2E",
            opacity: 0.5,
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          Last updated {LAST_UPDATED}
        </span>
      </nav>

      {/* Hero */}
      <header className="px-6 pt-14 pb-10 max-w-3xl mx-auto">
        <span
          className="text-xs tracking-widest uppercase block mb-4"
          style={{
            fontFamily: "'IBM Plex Mono', monospace",
            color: "#1E8E5A",
          }}
        >
          Legal · Privacy
        </span>
        <h1
          className="text-4xl sm:text-5xl font-bold leading-tight mb-4"
          style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#161A2E" }}
        >
          Your data,
          <br />
          your rules.
        </h1>
        <p
          className="text-lg leading-relaxed max-w-xl"
          style={{ color: "#161A2E", opacity: 0.65 }}
        >
          We keep this simple: ResumeFree works in your browser. No hidden
          servers, no data harvesting, no ads. Here's the full picture.
        </p>
        {/* Amber rule */}
        <div
          className="mt-8 h-0.5 w-16 rounded-full"
          style={{ background: "#E2A33B" }}
        />
      </header>

      {/* Table of contents (desktop sidebar on large, horizontal scroll on mobile) */}
      <div className="max-w-3xl mx-auto px-6 mb-10">
        <div
          className="flex gap-3 overflow-x-auto pb-2 sm:flex-wrap"
          style={{ scrollbarWidth: "none" }}
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors hover:border-current"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                color: "#161A2E",
                borderColor: "#DDD6C8",
                background: "transparent",
              }}
            >
              {s.label} {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Sections */}
      <main className="max-w-3xl mx-auto px-6 pb-24 space-y-0">
        {sections.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="py-10"
            style={{
              borderTop: idx === 0 ? "none" : "1px solid #DDD6C8",
            }}
          >
            <div className="flex items-start gap-6">
              {/* Label */}
              <span
                className="hidden sm:block text-xs pt-1 flex-shrink-0 w-8"
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  color: "#161A2E",
                  opacity: 0.35,
                }}
              >
                {section.label}
              </span>

              {/* Content */}
              <div className="flex-1 space-y-5">
                <h2
                  className="text-xl font-semibold"
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: "#161A2E",
                  }}
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

      {/* Footer strip */}
      <footer
        className="border-t px-6 py-6"
        style={{ borderColor: "#DDD6C8" }}
      >
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <span
            className="text-xs"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#161A2E",
              opacity: 0.45,
            }}
          >
            © {new Date().getFullYear()} ResumeFree · Updated {LAST_UPDATED}
          </span>
          <Link
            to="/"
            className="text-xs hover:opacity-70 transition-opacity"
            style={{
              fontFamily: "'IBM Plex Mono', monospace",
              color: "#1E8E5A",
            }}
          >
            ← Back to builder
          </Link>
        </div>
      </footer>
    </div>
  );
}