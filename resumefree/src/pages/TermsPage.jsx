// src/pages/TermsPage.jsx
import { Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const LAST_UPDATED = "June 2026";

const sections = [
  {
    id: "acceptance",
    label: "01",
    title: "Acceptance of Terms",
    content: [
      {
        type: "p",
        text: "By accessing or using ResumeFree (\"the Service\"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Service. These terms apply to all visitors and users — free or paid.",
      },
    ],
  },
  {
    id: "service",
    label: "02",
    title: "Our Service",
    content: [
      {
        type: "p",
        text: "ResumeFree is a free AI-powered resume builder for Indian college students. We provide tools to create, improve, and download resumes as PDFs — with no sign-up required for the free tier.",
      },
      {
        type: "p",
        text: "We may modify, suspend, or discontinue the Service at any time with reasonable notice. Significant changes will always be communicated to premium users.",
      },
      {
        type: "p",
        text: "The Service is for personal, non-commercial use. You may not use ResumeFree to build resumes on behalf of others for commercial gain without written permission from us.",
      },
    ],
  },
  {
    id: "free-premium",
    label: "03",
    title: "Free vs Premium",
    content: [
      {
        type: "p",
        text: "The free tier includes limited AI bullet improvements (3 total), one basic ATS score check, and instant PDF download — at zero cost, no sign-up required.",
      },
      {
        type: "p",
        text: "Premium features — including unlimited AI improvements, JD matcher, advanced ATS analysis, and cover letter generation — require a paid subscription at ₹199/month or ₹499/year and an account.",
      },
      {
        type: "p",
        text: "We reserve the right to adjust free-tier limits or premium pricing with 30 days' advance notice to existing subscribers.",
      },
    ],
  },
  {
    id: "ai-content",
    label: "04",
    title: "AI-Generated Content",
    content: [
      {
        type: "p",
        text: "ResumeFree uses AI models to suggest improved bullet points, ATS scores, and other resume content. AI suggestions are generated automatically and may not always be accurate or error-free.",
      },
      {
        type: "p",
        text: "You are responsible for reviewing all AI-generated content before submitting your resume. Do not include suggestions that misrepresent your experience.",
      },
      {
        type: "linkp",
        before: "We do not store your resume data on our servers. All form data stays in your browser's local storage. Only the specific bullet text you choose to improve is sent to our AI service — see our ",
        linkText: "Privacy Policy",
        linkTo: "/privacy",
        after: " for full details.",
      },
    ],
  },
  {
    id: "payments",
    label: "05",
    title: "Payments & Refunds",
    content: [
      {
        type: "p",
        text: "All payments are processed securely via Razorpay. We accept UPI, credit/debit cards, and net banking. ResumeFree never stores your payment details — transactions are handled entirely by Razorpay.",
      },
      {
        type: "subsection",
        heading: "Refund policy",
        text: "We offer a full refund within 7 days of your first premium subscription payment if you are unsatisfied. After 7 days, no refunds are issued for the current billing cycle. To request a refund, email support@resumefree.in with your registered email and payment ID.",
      },
      {
        type: "p",
        text: "Subscriptions auto-renew unless cancelled before the billing date. You can cancel anytime from your account settings — no questions asked.",
      },
    ],
  },
  {
    id: "liability",
    label: "06",
    title: "Limitation of Liability",
    content: [
      {
        type: "p",
        text: "ResumeFree is provided \"as is\" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that AI-generated content will result in job offers or interview calls.",
      },
      {
        type: "p",
        text: "To the maximum extent permitted by law, ResumeFree and its founders shall not be liable for any indirect, incidental, or consequential damages arising from your use of the Service, including but not limited to loss of data, missed job opportunities, or reliance on AI suggestions.",
      },
      {
        type: "p",
        text: "Our total liability to you for any claim shall not exceed the amount you paid us in the 3 months preceding the claim.",
      },
    ],
  },
  {
    id: "contact",
    label: "07",
    title: "Contact Us",
    content: [
      {
        type: "p",
        text: "For questions about these Terms, reach out at the email below. We typically respond within 24 hours.",
      },
      {
        type: "contact",
        email: "support@resumefree.in",
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

    case "linkp":
      return (
        <p className="text-[15.5px] leading-relaxed text-[#1e3a5f]">
          {block.before}
          <Link
            to={block.linkTo}
            className="text-[#059669] underline underline-offset-2 hover:text-[#0a1628] transition-colors"
          >
            {block.linkText}
          </Link>
          {block.after}
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

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#f8fafc] font-sohne">
      <Navbar />

      {/* Hero */}
      <header className="max-w-3xl mx-auto px-6 pt-[120px] sm:pt-[136px] pb-10">
        <span className="text-[11px] font-semibold tracking-widest uppercase block mb-4 text-[#059669]">
          Legal · Terms of Service
        </span>
        <h1
          className="text-[2.75rem] sm:text-[3.25rem] leading-[1.08] mb-4 text-[#0a1628]"
          style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.5px" }}
        >
          The fine print,
          <br />
          made readable.
        </h1>
        <p className="text-[17px] leading-relaxed max-w-xl text-[#1e3a5f]">
          By using ResumeFree, you agree to these Terms of Service. Questions?{" "}
          
            <a href="mailto:support@resumefree.in"
            className="text-[#059669] underline underline-offset-2 hover:text-[#0a1628] transition-colors"
          >
            support@resumefree.in
          </a>
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