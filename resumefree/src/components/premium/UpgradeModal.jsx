// src/components/premium/UpgradeModal.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { supabase } from "../../utils/supabaseClient";

const PASSES = {
  sprint: {
    name: "Sprint Pass",
    price: 79,
    durationShort: "7-day access",
    tagline: "One urgent application to nail",
  },
  placement: {
    name: "Placement Pass",
    price: 199,
    durationShort: "30-day access",
    tagline: "Full placement drive, multiple companies",
    badge: "Most Popular",
  },
  season: {
    name: "Season Pass",
    price: 399,
    durationShort: "90-day access",
    tagline: "Full Aug–Dec or Jan–Apr cycle",
    badge: "Best Value",
  },
};

export default function UpgradeModal({ onClose }) {
  const personal = useResumeStore((s) => s.resume.personal);
  const [pass, setPass] = useState("placement");
  const [email, setEmail] = useState(personal.email || "");
  const [status, setStatus] = useState("idle"); // idle | processing | sent | error
  const [errorMsg, setErrorMsg] = useState("");

  const handlePay = async () => {
    if (!email || !email.includes("@")) {
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
        description: `${PASSES[pass].name}`,
        prefill: { email, name: personal.name || "" },
        theme: { color: "#059669" },
        handler: async (response) => {
          try {
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email,
                name: personal.name || "",
                pass_type: pass,
                amount: order.amount,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyData.error || "Verification failed");

            // 3. Send the passwordless login link
            await supabase.auth.signInWithOtp({
              email,
              options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
            });

            setStatus("sent");
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

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0a1628]/60 backdrop-blur-sm px-4">
      <div
        className="bg-[#f8fafc] rounded-3xl max-w-md w-full p-7 relative border border-[#cbd5e1]/60"
        style={{
          boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.18) 0px 24px 48px -12px",
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#4a6fa5] hover:text-white hover:bg-[#0a1628] transition-all duration-200 text-lg leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {status === "sent" ? (
          <div className="text-center py-8">
            <div
              className="mx-auto mb-5 w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 8px 24px -6px rgba(5,150,105,0.45)",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 7l9 6 9-6M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"
                  stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3
              className="text-[22px] text-[#0a1628] mb-2"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Check your email
            </h3>
            <p className="text-[14.5px] text-[#1e3a5f] leading-relaxed font-sohne">
              We&apos;ve sent a login link to <strong className="text-[#0a1628]">{email}</strong>.
              Click it to unlock Premium — no password needed.
            </p>
          </div>
        ) : (
          <>
            <span className="inline-block font-sohne text-[11px] font-semibold tracking-widest uppercase text-[#059669] mb-2">
              ✦ Upgrade to Premium
            </span>
            <h3
              className="text-[26px] text-[#0a1628] mb-2 leading-[1.1]"
              style={{ fontFamily: "'DM Serif Display', serif" }}
            >
              Unlock everything
            </h3>
            <p className="font-sohne text-[14px] text-[#4a6fa5] mb-6 leading-relaxed">
              Unlimited AI, JD matcher, advanced ATS, cover letters & more.
            </p>

            <div className="flex flex-col gap-2.5 mb-5">
              {Object.entries(PASSES).map(([key, p]) => {
                const active = pass === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setPass(key)}
                    className={`relative rounded-2xl px-4 py-3.5 text-left transition-all duration-200 border flex items-center justify-between gap-3 ${
                      active
                        ? "border-[#059669] bg-[#ecfdf5]"
                        : "border-[#cbd5e1] bg-white hover:border-[#4a6fa5]/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-sohne text-[13.5px] font-semibold text-[#0a1628]">
                          {p.name}
                        </span>
                        {p.badge && (
                          <span className="font-sohne text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d1fae5] text-[#059669] whitespace-nowrap">
                            {p.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-sohne text-[11.5px] text-[#4a6fa5] truncate">
                        {p.tagline} · {p.durationShort}
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span
                        className="font-signifier text-[20px] text-[#0a1628] leading-none"
                        style={{ letterSpacing: "-0.3px" }}
                      >
                        ₹{p.price}
                      </span>
                      <span
                        className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 ${
                          active ? "bg-[#059669]" : "border border-[#cbd5e1]"
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

            <label className="block text-[11px] font-semibold tracking-widest uppercase text-[#4a6fa5] mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-white border border-[#cbd5e1] rounded-2xl px-4 py-3 text-sm text-[#0a1628] placeholder:text-[#4a6fa5]/50 focus:outline-none focus:border-[#059669] focus:ring-2 focus:ring-[#059669]/15 transition-all duration-150 mb-2"
            />
            <p className="font-sohne text-[12px] text-[#4a6fa5]/80 mb-5">
              We&apos;ll send a login link here — no password needed.
            </p>

            {errorMsg && (
              <p className="font-sohne text-[12.5px] text-[#dc2626] mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl">
                {errorMsg}
              </p>
            )}

            <button
              type="button"
              onClick={handlePay}
              disabled={status === "processing"}
              className="w-full bg-[#0a1628] text-white font-sohne text-[14.5px] font-semibold py-3.5 rounded-full hover:bg-[#1e3a5f] transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {status === "processing" ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${PASSES[pass].price} & Unlock ${PASSES[pass].name}`
              )}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}