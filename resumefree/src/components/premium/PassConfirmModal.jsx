// src/components/premium/PassConfirmModal.jsx
// Confirm screen shown right before Razorpay opens — last chance to
// review what's being bought, for both "just logged in" and
// "already logged in, clicked a pass" flows.
//
// SECURITY: payment flow now goes through the backend (server.js):
//   1. POST /api/create-order   → real Razorpay order_id (amount set server-side from PASS_CONFIG)
//   2. Razorpay checkout opens with that order_id
//   3. POST /api/verify-payment → backend verifies the HMAC signature and
//      updates `profiles`/`payments` itself using the service role key.
// The client never writes is_premium / payments rows directly anymore.

import { createPortal } from "react-dom";
import { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { getPass } from "../../utils/passes";

const API_BASE = "http://localhost:3001";

export default function PassConfirmModal({ passKey, onClose, onSuccess }) {
  const [paying, setPaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const pass = getPass(passKey);
  if (!pass) return null;

  const handlePay = async () => {
    if (!window.Razorpay) {
      setErrorMsg("Payment system failed to load. Please refresh and try again.");
      return;
    }

    setPaying(true);
    setErrorMsg("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expired — please sign in again.");

      // 1. Create a real Razorpay order on the backend (amount comes from
      // server-side PASS_CONFIG, never trusted from the client).
      const orderRes = await fetch(`${API_BASE}/api/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pass_type: passKey }),
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Could not start payment. Try again.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "ResumeFree",
        description: pass.name,
        theme: { color: "#7451f2" },
        prefill: {
          email: user.email,
          name: user.user_metadata?.full_name || "",
        },
        handler: async (response) => {
          try {
            // 2. Hand the signed response to the backend for verification.
            // Backend checks the HMAC signature and only then updates
            // is_premium / premium_expires_at / payments — client never
            // touches those tables directly.
            const verifyRes = await fetch(`${API_BASE}/api/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                email: user.email,
                name: user.user_metadata?.full_name || null,
                pass_type: passKey,
                amount: orderData.amount / 100,
              }),
            });
            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.success) {
              throw new Error(verifyData.error || "Payment verification failed.");
            }

            setPaying(false);
            onSuccess();
          } catch (err) {
            setPaying(false);
            setErrorMsg(
              err.message || "Payment succeeded but verification failed — contact support."
            );
          }
        },
        modal: {
          ondismiss: () => setPaying(false),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setPaying(false);
      setErrorMsg(err.message || "Could not start payment. Try again.");
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-graphite-ink/55 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-paper-white rounded-cards border border-mist overflow-hidden"
      >
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-mist">
          <p className="font-mono text-[11px] font-semibold tracking-widest uppercase text-ash mb-1">
            {pass.featured ? "⭐ Most Popular" : "Confirm your pass"}
          </p>
          <h2 className="font-heading text-[26px] text-graphite-ink">{pass.name}</h2>
          <p className="font-body text-[14px] mt-1 text-ash">{pass.tagline}</p>
        </div>

        {/* Price + duration */}
        <div className="px-7 py-6">
          <div className="flex items-end gap-2 mb-3">
            <span className="font-heading text-[44px] text-graphite-ink">₹{pass.price}</span>
            <span className="font-body text-[13px] pb-2 text-ash">one-time</span>
          </div>

          <span className="inline-flex items-center gap-1.5 font-body text-[12px] font-semibold px-3 py-1 rounded-full bg-success-bg border border-success-border text-success-text">
            <span className="w-1.5 h-1.5 rounded-full bg-success-text" />
            {pass.durationLabel}
          </span>

          <p className="font-body text-[13px] mt-4 leading-relaxed text-slate">
            {pass.isAddon
              ? "🔒 One-time payment via Razorpay. This unlocks the feature instantly — no expiry, no auto-renewal."
              : `🔒 One-time payment via Razorpay. No auto-renewal — your pass simply expires after ${pass.durationDays} days.`}
          </p>

          {errorMsg && (
            <div className="mt-4 px-3 py-2.5 rounded-inputs font-body text-[13px] bg-error-bg border border-error-border text-error-text">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-7 pb-7 flex flex-col gap-2.5">
          <button
            onClick={handlePay}
            disabled={paying}
            className="w-full py-3.5 bg-graphite-ink text-paper-white font-body font-semibold text-[15px] rounded-buttons shadow-cta transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-slate"
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
            className="w-full py-2.5 font-body font-medium text-[14px] text-ash transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}