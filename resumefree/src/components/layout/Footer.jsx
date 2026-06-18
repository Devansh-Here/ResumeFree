// src/components/layout/Footer.jsx
import { Link } from "react-router-dom";

const LINKS = [
  { label: "How It Works", href: "#how-it-works", internal: false },
  { label: "Pricing", href: "#pricing", internal: false },
  { label: "Privacy Policy", href: "/privacy", internal: true },
  { label: "Terms of Use", href: "/terms", internal: true },
];

export default function Footer() {
  return (
    <footer className="bg-[#161A2E] text-[#F6F4EF] px-4 py-10 sm:py-12">
      <div className="max-w-5xl mx-auto">

        {/* Top row — logo + links */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 w-fit">
            <span
              className="font-mono text-[10px] font-bold tracking-widest text-[#1E8E5A] uppercase border border-[#1E8E5A] px-1.5 py-0.5 rounded-sm"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              ATS
            </span>
            <span
              className="font-bold text-lg text-[#F6F4EF] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Resume<span className="text-[#1E8E5A]">Free</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="flex flex-wrap gap-x-5 gap-y-2">
            {LINKS.map(({ label, href, internal }) =>
              internal ? (
                <Link
                  key={label}
                  to={href}
                  className="text-sm text-[#F6F4EF]/50 hover:text-[#F6F4EF] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={href}
                  className="text-sm text-[#F6F4EF]/50 hover:text-[#F6F4EF] transition-colors"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {label}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Divider */}
        <div className="border-t border-[#F6F4EF]/10 my-7" />

        {/* Bottom row — tagline + copyright */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p
            className="text-xs text-[#F6F4EF]/35"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            Free AI Resume Builder for Indian Students — No Sign-Up, Download PDF Instantly
          </p>
          <p
            className="text-xs text-[#F6F4EF]/25"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            © {new Date().getFullYear()} ResumeFree
          </p>
        </div>

      </div>
    </footer>
  );
}