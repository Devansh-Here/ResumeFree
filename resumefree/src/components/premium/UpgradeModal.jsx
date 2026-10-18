// src/components/premium/UpgradeModal.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { useAuthStore } from "../../store/authStore";
import { supabase } from "../../utils/supabaseClient";
import { PASS_DETAILS, FULL_PASS_KEYS } from "../../utils/passes";

// What every full pass (Sprint / Placement / Season) unlocks — shown on the
// post-payment success screen. All three full passes share the same
// feature set; only price/duration differ (see PASS_DETAILS).
const UNLOCKED_FEATURES = [
  { icon: "⚡", label: "Unlimited AI improvements" },
  { icon: "🎯", label: "JD Matcher" },
  { icon: "📊", label: "Advanced ATS score" },
  { icon: "✍️", label: "AI Cover Letters" },
  { icon: "🎨", label: "20+ premium templates" },
  { icon: "💾", label: "Unlimited saved versions" },
];

export default function UpgradeModal({ onClose }) {
  const personal = useResumeStore((s) => s.resume.personal);
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);

  const isLoggedIn = !!user;

  const [pass, setPass] = useState("placement");
  const [email, setEmail] = useState(personal.email || "");
  // idle | processing | sent (magic link, logged-out flow) |
  // activated (instant, logged-in flow) | error
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const selectedPass = PASS_DETAILS[pass];
  // Logged-in users pay with their session email — never re-typed.
  const effectiveEmail = isLoggedIn ? user.email : email;

  const handlePay = async () => {
    if (!isLoggedIn && (!email || !email.includes("@"))) {
      setErrorMsg("Please enter a valid email");
      return;
    }
    if (!window.Razorpay) {
      setErrorMsg("Payment system is still loading — try again in a second");
      return;
    }

    setErrorMsg("");
    setStatus("processing");

    try {
      // 1. Ask backend to create a Razorpay order
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass_type: pass }),
      });
      const order = await orderRes.json();
      if (!orderRes.ok) throw new Error(order.error || "Could not start payment");

      // 2. Open Razorpay checkout
      const rzp = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        order_id: order.orderId,
        name: "ResumeFree",
        description: selectedPass.name,
        prefill: { email: effectiveEmail, name: personal.name || "" },
        theme: { color: "#7451f2" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: effectiveEmail,
                name: personal.name || "",
                pass_type: pass,
                // Note: server.js now ignores this and derives the true
                // amount from its own PASS_CONFIG — kept here only for
                // logging/debugging visibility, not trusted by the backend.
                amount: order.amount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            if (isLoggedIn) {
              // Already authenticated — no magic link needed. Just pull
              // the freshly-updated profile (is_premium / active_pass_type
              // / premium_expires_at) into the store so the rest of the
              // app reflects Premium immediately.
              await fetchProfile();
              setStatus("activated");
            } else {
              // BUG FIX: this modal opens from inside the Builder (Sidebar's
              // "Upgrade to Premium" button), and the payment happens BEFORE
              // login — unlike PricingPage's flow (login first, pay after).
              // Because of that, AuthCallback.jsx had nothing to tell it
              // where to send the user back to once they click the login
              // link in their email — it only ever checked for a
              // `pendingPass` (a pass still waiting to be *bought*, which
              // doesn't apply here since the purchase is already done). It
              // silently fell back to /dashboard instead of returning to the
              // Builder. Stash just the return destination — no pendingPass,
              // since nothing is still pending — so AuthCallback.jsx can send
              // the user straight back to where they were.
              localStorage.setItem("resumefree_pending_return_to", "/builder");

              // 3. Send the passwordless login link
              await supabase.auth.signInWithOtp({
                email,
                options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
              });

              setStatus("sent");
            }
          } catch (err) {
            setErrorMsg(err.message);
            setStatus("error");
          }
        },
        modal: {
          ondismiss: () => setStatus((s) => (s === "processing" ? "idle" : s)),
        },
      });

      rzp.on("payment.failed", (resp) => {
        setErrorMsg(resp.error?.description || "Payment failed. No money was deducted.");
        setStatus("error");
      });

      rzp.open();
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  // The "activated" success state uses a wider horizontal layout (matches
  // the project's established "centered wide modal" pattern — see
  // ATSContent.jsx / TemplateSwitcherContent.jsx) instead of the narrower
  // vertical card used for the pass-selection / magic-link states below.
  const isActivated = status === "activated";

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-graphite-ink/60 backdrop-blur-sm px-4">
      <div
        className={`bg-paper-white rounded-cards w-full p-7 relative border border-mist transition-all duration-200 ${
          isActivated ? "max-w-[720px]" : "max-w-md"
        }`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-ash hover:text-paper-white hover:bg-graphite-ink transition-all duration-200 text-lg leading-none z-10"
          aria-label="Close"
        >
          ×
        </button>

        {isActivated ? (
          <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr] gap-7 items-center">
            {/* Left — celebration + CTA */}
            <div className="text-center sm:text-left">
              <div className="relative mx-auto sm:mx-0 mb-4 w-14 h-14">
                <span className="absolute inset-0 rounded-full bg-iris-violet/20 animate-ping" />
                <div className="relative w-14 h-14 rounded-cards flex items-center justify-center bg-success-bg border border-success-border">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {["#7451f2", "#059669", "#b45309"].map((c, i) => (
                  <span
                    key={c}
                    className="absolute w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: c,
                      top: i === 0 ? "-6px" : "auto",
                      bottom: i !== 0 ? "-6px" : "auto",
                      left: i < 2 ? "-8px" : "auto",
                      right: i >= 2 ? "-8px" : "auto",
                      animationDelay: `${i * 120}ms`,
                    }}
                  />
                ))}
              </div>

              <span className="inline-block font-mono text-[10px] font-semibold tracking-widest uppercase text-iris-violet mb-1.5">
                ✦ Payment successful
              </span>
              <h3 className="font-heading text-[26px] text-graphite-ink mb-1.5 leading-[1.1]">
                You&apos;re Premium!
              </h3>
              <p className="font-body text-[13.5px] text-slate leading-relaxed mb-5">
                {selectedPass.name} active for {selectedPass.durationLabel}.
              </p>

              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto bg-graphite-ink text-paper-white font-body text-[14px] font-semibold px-5 py-3 rounded-buttons shadow-cta hover:bg-slate transition-all duration-200"
              >
                Start using Premium →
              </button>
            </div>

            {/* Right — unlocked features, 2-column grid so it stays flat/wide
                instead of a tall stacked list */}
            <div className="grid grid-cols-2 gap-2.5">
              {UNLOCKED_FEATURES.map((f) => (
                <div
                  key={f.label}
                  className="flex items-center gap-2.5 px-3 py-3 rounded-cards bg-soft-snow border border-mist"
                >
                  <span className="w-7 h-7 shrink-0 rounded-buttons bg-iris-violet/10 flex items-center justify-center text-[13px]">
                    {f.icon}
                  </span>
                  <span className="font-body text-[12.5px] text-graphite-ink font-medium leading-snug">
                    {f.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Mascot slot — reserved for the future ResumeFree companion
                character (design system v2, Section 9d). Intentionally
                empty until that asset is designed. */}
          </div>
        ) : status === "sent" ? (
          <div className="text-center py-8">
            <div
              className="mx-auto mb-5 w-14 h-14 rounded-cards flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #7451f2 0%, #5952a1 100%)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="font-heading text-[26px] text-graphite-ink mb-2">
              Check your email
            </h3>
            <p className="font-body text-[14.5px] text-slate leading-relaxed">
              We&apos;ve sent a login link to <strong className="text-graphite-ink">{email}</strong>.
              Click it to unlock Premium — no password needed.
            </p>
          </div>
        ) : (
          <>
            <span className="inline-block font-mono text-[11px] font-semibold tracking-widest uppercase text-iris-violet mb-2">
              ✦ Upgrade to Premium
            </span>
            <h3 className="font-heading text-[32px] text-graphite-ink mb-2 leading-[1.1]">
              Unlock everything
            </h3>
            <p className="font-body text-[14px] text-ash mb-6 leading-relaxed">
              Unlimited AI, JD matcher, advanced ATS, cover letters & more.
            </p>

            <div className="flex flex-col gap-2.5 mb-5">
              {FULL_PASS_KEYS.map((key) => {
                const p = PASS_DETAILS[key];
                const active = pass === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPass(key)}
                    className={`relative rounded-cards px-4 py-3.5 text-left transition-all duration-200 border flex items-center justify-between gap-3 ${
                      active
                        ? "border-iris-violet bg-iris-violet/[0.06]"
                        : "border-mist bg-paper-white hover:border-deep-iris/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-body text-[13.5px] font-semibold text-graphite-ink">
                          {p.name}
                        </span>
                        {p.badge && (
                          <span className="font-mono text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-iris-violet/10 text-iris-violet whitespace-nowrap">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-body text-[11.5px] text-ash truncate">
                        {p.tagline} · {p.durationLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className="font-heading text-[20px] text-graphite-ink leading-none"
                        style={{ letterSpacing: "-0.3px" }}
                      >
                        ₹{p.price}
                      </span>
                      <span
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                          active ? "bg-iris-violet" : "border border-mist"
                        }`}
                        style={{ width: "18px", height: "18px" }}
                      >
                        {active && (
                          <svg width="9" height="9" viewBox="0 0 14 14" fill="none">
                            <path d="M2.5 7l3 3 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {isLoggedIn ? (
              <div className="flex items-center gap-2 mb-5 px-3.5 py-2.5 bg-soft-snow border border-mist rounded-inputs">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
                  <path d="M20 6L9 17l-5-5" stroke="#059669" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="font-body text-[12.5px] text-slate truncate">
                  Paying as <strong className="text-graphite-ink">{user.email}</strong>
                </p>
              </div>
            ) : (
              <>
                <label className="block font-mono text-[11px] font-semibold tracking-widest uppercase text-ash mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-paper-white border border-mist rounded-inputs px-4 py-3 text-sm font-body text-graphite-ink placeholder:text-fog focus:outline-none focus:border-iris-violet focus:ring-2 focus:ring-iris-violet/20 transition-all duration-150 mb-2"
                />
                <p className="font-body text-[12px] text-fog mb-5">
                  We&apos;ll send a login link here — no password needed.
                </p>
              </>
            )}

            {errorMsg && (
              <p className="font-body text-[12.5px] text-error-text mb-4 px-3.5 py-2.5 bg-error-bg border border-error-border rounded-inputs">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={status === "processing"}
              className="w-full bg-graphite-ink text-paper-white font-body text-[14.5px] font-semibold py-3.5 rounded-buttons shadow-cta hover:bg-slate transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "processing" ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${selectedPass.price} & Unlock ${selectedPass.name}`
              )}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}