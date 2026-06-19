import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

const sections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'service', label: 'Our Service' },
  { id: 'free-premium', label: 'Free vs Premium' },
  { id: 'ai-content', label: 'AI-Generated Content' },
  { id: 'payments', label: 'Payments & Refunds' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'contact', label: 'Contact Us' },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Terms of Service
          </h1>

          <p className="text-sm text-gray-500">
            Last updated: June 2025
          </p>

          <p className="mt-4 text-gray-600 text-sm leading-relaxed">
            By using ResumeFree, you agree to these Terms of Service. Questions?{' '}
            <a
              href="mailto:support@resumefree.in"
              className="text-blue-600 hover:underline"
            >
              support@resumefree.in
            </a>
          </p>
        </div>

        <div className="flex gap-10">
          {/* Sticky TOC sidebar */}
          <aside className="hidden md:block w-52 shrink-0">
            <div className="sticky top-8">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                On this page
              </p>

              <nav className="flex flex-col gap-1">
                {sections.map((s) => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="text-sm text-gray-500 hover:text-blue-600 transition-colors py-0.5"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-12 text-sm text-gray-600 leading-relaxed">
            <section id="acceptance">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using ResumeFree ("the Service"), you agree to
                be bound by these Terms of Service. If you do not agree, please
                do not use the Service. These terms apply to all visitors and
                users — free or paid.
              </p>
            </section>

            <section id="service">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                2. Our Service
              </h2>

              <div className="space-y-3">
                <p>
                  ResumeFree is a free AI-powered resume builder for Indian
                  college students. We provide tools to create, improve, and
                  download resumes as PDFs — with no sign-up required for the
                  free tier.
                </p>

                <p>
                  We may modify, suspend, or discontinue the Service at any time
                  with reasonable notice. Significant changes will always be
                  communicated to premium users.
                </p>

                <p>
                  The Service is for personal, non-commercial use. You may not
                  use ResumeFree to build resumes on behalf of others for
                  commercial gain without written permission from us.
                </p>
              </div>
            </section>

            <section id="free-premium">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                3. Free vs Premium
              </h2>

              <div className="space-y-3">
                <p>
                  The free tier includes limited AI bullet improvements (3
                  total), one basic ATS score check, and instant PDF download —
                  at zero cost, no sign-up required.
                </p>

                <p>
                  Premium features — including unlimited AI improvements, JD
                  matcher, advanced ATS analysis, and cover letter generation —
                  require a paid subscription at ₹199/month or ₹499/year and an
                  account.
                </p>

                <p>
                  We reserve the right to adjust free-tier limits or premium
                  pricing with 30 days' advance notice to existing subscribers.
                </p>
              </div>
            </section>

            <section id="ai-content">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                4. AI-Generated Content
              </h2>

              <div className="space-y-3">
                <p>
                  ResumeFree uses AI models to suggest improved bullet points,
                  ATS scores, and other resume content. AI suggestions are
                  generated automatically and may not always be accurate or
                  error-free.
                </p>

                <p>
                  You are responsible for reviewing all AI-generated content
                  before submitting your resume. Do not include suggestions that
                  misrepresent your experience.
                </p>

                <p>
                  We do not store your resume data on our servers. All form data
                  stays in your browser's local storage. Only the specific
                  bullet text you choose to improve is sent to our AI service —
                  see our{' '}
                  <Link
                    to="/privacy"
                    className="text-blue-600 hover:underline"
                  >
                    Privacy Policy
                  </Link>{' '}
                  for full details.
                </p>
              </div>
            </section>

            <section id="payments">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                5. Payments & Refunds
              </h2>

              <div className="space-y-3">
                <p>
                  All payments are processed securely via Razorpay. We accept
                  UPI, credit/debit cards, and net banking. ResumeFree never
                  stores your payment details — transactions are handled
                  entirely by Razorpay.
                </p>

                <p>
                  <span className="font-medium text-gray-800">
                    Refund policy:
                  </span>{' '}
                  We offer a full refund within 7 days of your first premium
                  subscription payment if you are unsatisfied. After 7 days, no
                  refunds are issued for the current billing cycle. To request a
                  refund, email{' '}
                  <a
                    href="mailto:support@resumefree.in"
                    className="text-blue-600 hover:underline"
                  >
                    support@resumefree.in
                  </a>{' '}
                  with your registered email and payment ID.
                </p>

                <p>
                  Subscriptions auto-renew unless cancelled before the billing
                  date. You can cancel anytime from your account settings — no
                  questions asked.
                </p>
              </div>
            </section>

            <section id="liability">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                6. Limitation of Liability
              </h2>

              <div className="space-y-3">
                <p>
                  ResumeFree is provided "as is" without warranties of any kind.
                  We do not guarantee that the Service will be uninterrupted,
                  error-free, or that AI-generated content will result in job
                  offers or interview calls.
                </p>

                <p>
                  To the maximum extent permitted by law, ResumeFree and its
                  founders shall not be liable for any indirect, incidental, or
                  consequential damages arising from your use of the Service,
                  including but not limited to loss of data, missed job
                  opportunities, or reliance on AI suggestions.
                </p>

                <p>
                  Our total liability to you for any claim shall not exceed the
                  amount you paid us in the 3 months preceding the claim.
                </p>
              </div>
            </section>

            <section id="contact">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                7. Contact Us
              </h2>

              <p>
                For questions about these Terms, reach out at{' '}
                <a
                  href="mailto:support@resumefree.in"
                  className="text-blue-600 hover:underline"
                >
                  support@resumefree.in
                </a>
                . We typically respond within 24 hours.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}