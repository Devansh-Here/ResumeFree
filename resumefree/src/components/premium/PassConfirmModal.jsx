// src/components/premium/PassConfirmModal.jsx
// Confirm screen shown right before Razorpay opens — last chance to
// review what's being bought, for both "just logged in" and
// "already logged in, clicked a pass" flows.

import { createPortal } from "react-dom";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { getPass } from "../../utils/passes";

export default function PassConfirmModal({ passKey, onClose, onSuccess }) {
  const [paying, setPaying] = useState(false);
  const [error, setPaying2] = useState(""); // (kept simple, see error state below)
  const [errorMsg, setErrorMsg] = useState("");

  const pass = getPass(passKey);
  if (!pass) return null;

  const handlePay = () => {
    if (!window.Razorpay) {
      setErrorMsg("Payment system failed to load. Please refresh and try again.");
      return;
    }

    setPaying(true);
    setErrorMsg("");

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: pass.price * 100, // paise
      currency: "INR",
      name: "ResumeFree",
      description: pass.name,
      theme: { color: "#059669" },
      handler: async (response) => {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) throw new Error("Session expired — please sign in again.");

          const expiresAt = new Date(
            Date.now() + pass.durationDays * 24 * 60 * 60 * 1000
          ).toISOString();

          // ⚠️ TEST MODE: no server-side signature verification yet.
          // Before going live, move this update behind a verified
          // backend route (server.js) that checks the Razorpay signature
          // first — right now any client can call this with a fake id.
          const { error: profileErr } = await supabase
            .from("profiles")
            .update({
              is_premium: true,
              premium_expires_at: expiresAt,
              plan_type: pass.key,
            })
            .eq("id", user.id);

          if (profileErr) throw profileErr;

          await supabase.from("payments").insert({
            user_id: user.id,
            plan_type: pass.key,
            amount: pass.price,
            razorpay_id: response.razorpay_payment_id,
            status: "success",
          });

          setPaying(false);
          onSuccess();
        } catch (err) {
          setPaying(false);
          setErrorMsg(err.message || "Payment succeeded but saving failed — contact support.");
        }
      },
      modal: {
        ondismiss: () => setPaying(false),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(10,22,40,0.55)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-white overflow-hidden"
        style={{
          borderRadius: "24px",
          boxShadow: "rgba(15,23,42,0.04) 0px 0px 0px 1px, rgba(0,0,0,0.25) 0px 24px 48px -8px",
        }}
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-[#cbd5e1]/50">
          <p
            className="text-[11px] font-semibold tracking-widest uppercase mb-1"
            style={{ color: "#4a6fa5" }}
          >
            {pass.featured ? "⭐ Most Popular" : "Confirm your pass"}
          </p>
          <h2
            style={{ fontFamily: "'DM Serif Display', serif", fontSize: "26px", color: "#0a1628" }}
          >
            {pass.name}
          </h2>
          <p className="text-[14px] mt-1" style={{ color: "#4a6fa5" }}>
            {pass.tagline}
          </p>
        </div>

        {/* Price + duration */}
        <div className="px-7 py-6">
          <div className="flex items-end gap-2 mb-3">
            <span
              style={{ fontFamily: "'DM Serif Display', serif", fontSize: "44px", color: "#0a1628" }}
            >
              ₹{pass.price}
            </span>
            <span className="text-[13px] pb-2" style={{ color: "#4a6fa5" }}>
              one-time
            </span>
          </div>

          <span
            className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-full"
            style={{ background: "#ecfdf5", border: "1px solid #d1fae5", color: "#059669" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#059669" }} />
            {pass.durationLabel}
          </span>

          <p className="text-[13px] mt-4 leading-relaxed" style={{ color: "#1e3a5f" }}>
            🔒 One-time payment via Razorpay. No auto-renewal — your pass simply
            expires after {pass.durationDays} days.
          </p>

          {errorMsg && (
            <div
              className="mt-4 px-3 py-2.5 rounded-2xl text-[13px]"
              style={{ background: "#d1fae5", color: "#0a1628", border: "1px solid #cbd5e1" }}
            >
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-7 pb-7 flex flex-col gap-2.5">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3.5 text-white font-semibold rounded-full transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "#059669", fontSize: "15px" }}
          >
            {paying ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Opening Razorpay…
              </>
            ) : (
              <>Pay ₹{pass.price} with Razorpay →</>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={paying}
            className="w-full py-2.5 font-medium text-[14px] transition-colors"
            style={{ color: "#4a6fa5" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}