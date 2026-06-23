// src/components/premium/UpgradeModal.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useResumeStore } from "../../store/resumeStore";
import { supabase } from "../../utils/supabaseClient";

const PLANS = {
  monthly: { label: "Monthly", price: 199, sub: "billed every month" },
  yearly: { label: "Yearly", price: 499, sub: "≈ ₹42/month · save big" },
};

export default function UpgradeModal({ onClose }) {
  const personal = useResumeStore((s) => s.resume.personal);
  const [plan, setPlan] = useState("yearly");
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
        body: JSON.stringify({ plan }),
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
        description: `Premium — ${PLANS[plan].label}`,
        prefill: { email, name: personal.name || "" },
        theme: { color: "#1E8E5A" },
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
                plan,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#161A2E]/60 px-4">
      <div className="bg-[#F6F4EF] rounded-lg max-w-md w-full p-6 relative border border-[#DDD6C8]">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-[#161A2E]/40 hover:text-[#161A2E] text-xl leading-none"
          aria-label="Close"
        >
          ×
        </button>

        {status === "sent" ? (
          <div className="text-center py-6">
            <div className="text-3xl mb-3">✉️</div>
            <h3
              className="text-lg font-bold text-[#161A2E] mb-2"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Check your email
            </h3>
            <p className="text-sm text-[#161A2E]/60" style={{ fontFamily: "'Inter', sans-serif" }}>
              We've sent a login link to <strong>{email}</strong>. Click it to unlock Premium —
              no password needed.
            </p>
          </div>
        ) : (
          <>
            <h3
              className="text-lg font-bold text-[#161A2E] mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              ✦ Upgrade to Premium
            </h3>
            <p
              className="text-sm text-[#161A2E]/60 mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Unlimited AI, JD matcher, advanced ATS, cover letters & more.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {Object.entries(PLANS).map(([key, p]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPlan(key)}
                  className={`border rounded-lg p-3 text-left transition-colors ${
                    plan === key
                      ? "border-[#1E8E5A] bg-[#1E8E5A]/5"
                      : "border-[#DDD6C8] hover:border-[#161A2E]/30"
                  }`}
                >
                  <div className="text-xs font-mono text-[#161A2E]/50 uppercase">{p.label}</div>
                  <div className="text-xl font-bold text-[#161A2E]">₹{p.price}</div>
                  <div className="text-[11px] text-[#161A2E]/50">{p.sub}</div>
                </button>
              ))}
            </div>

            <label
              className="block text-xs font-mono text-[#161A2E]/50 uppercase mb-1"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-[#DDD6C8] rounded px-3 py-2 mb-1 text-sm focus:outline-none focus:border-[#1E8E5A]"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            <p className="text-[11px] text-[#161A2E]/40 mb-4">
              We'll send a login link here — no password needed.
            </p>

            {errorMsg && <p className="text-xs text-red-600 mb-3">{errorMsg}</p>}

            <button
              type="button"
              onClick={handlePay}
              disabled={status === "processing"}
              className="w-full bg-[#161A2E] text-[#F6F4EF] font-semibold py-2.5 rounded hover:bg-[#1E8E5A] transition-colors disabled:opacity-50"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              {status === "processing" ? "Processing..." : `Pay ₹${PLANS[plan].price} & Upgrade`}
            </button>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}