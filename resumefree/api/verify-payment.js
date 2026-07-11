// api/verify-payment.js — Vercel Serverless Function
// Verifies a completed Razorpay payment, then marks the user premium
// (or unlocks the relevant addon) in Supabase.
//
// FIXED: this file was still on the old subscription model — `plan`
// ('monthly'/'yearly'), a non-existent `premium_plan` column, a
// client-supplied `amount` trusted as-is, and no addon handling at all.
// Now aligned with the pass-based model (Section 5m/5o of the handoff):
// reads `pass_type`, derives amount + duration server-side from
// PASS_DETAILS (single source of truth — client amount is never trusted),
// and branches between "full pass" (sets is_premium + active_pass_type +
// premium_expires_at) and "addon" (sets the matching addon_*_unlocked
// column only, no expiry) to match the actual `profiles` schema.
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { PASS_DETAILS } from "../src/utils/passes.js";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Maps an addon pass_type to its column in `profiles`.
const ADDON_COLUMN = {
  addon_cover_letter: "addon_cover_letter_unlocked",
  addon_jd_tailoring: "addon_jd_tailoring_unlocked",
  addon_ats: "addon_ats_unlocked",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    email,
    name,
    pass_type,
    // Client-supplied amount kept only for logging — never trusted for
    // what actually gets charged or recorded. See below.
    amount: clientAmount,
  } = req.body || {};

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature ||
    !email ||
    !pass_type
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const pass = PASS_DETAILS[pass_type];
  if (!pass) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  // Server-authoritative amount, in paise — matches what create-order.js
  // told Razorpay to charge. Never derived from clientAmount.
  const amount = pass.price * 100;

  // 1. Verify the Razorpay signature — proves the payment is genuine
  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ error: "Payment verification failed — signature mismatch" });
  }

  try {
    // 2. Find or create the auth user for this email
    let userId;
    const { data: existingUsers, error: listErr } = await supabaseAdmin.auth.admin.listUsers();
    if (listErr) throw listErr;

    const existing = existingUsers.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    );

    if (existing) {
      userId = existing.id;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      });
      if (createErr) throw createErr;
      userId = created.user.id;
    }

    let expiresAt = null;

    if (pass.isAddon) {
      // 3a. Addon purchase — unlock only the matching feature column.
      // No expiry, no change to is_premium/active_pass_type.
      const column = ADDON_COLUMN[pass_type];
      const { error: profileErr } = await supabaseAdmin
        .from("profiles")
        .upsert({
          id: userId,
          email,
          name: name || null,
          [column]: true,
        });
      if (profileErr) throw profileErr;
    } else {
      // 3b. Full pass purchase — sets is_premium + active_pass_type +
      // premium_expires_at, computed from PASS_DETAILS.durationDays.
      expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + pass.durationDays);

      const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
        id: userId,
        email,
        name: name || null,
        is_premium: true,
        active_pass_type: pass_type,
        premium_expires_at: expiresAt.toISOString(),
      });
      if (profileErr) throw profileErr;
    }

    // 4. Record the payment for history/support purposes
    const { error: paymentErr } = await supabaseAdmin.from("payments").insert({
      profile_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      amount,
      pass_type,
      duration_days: pass.durationDays,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
      status: "success",
    });
    if (paymentErr) throw paymentErr;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("verify-payment error:", error);
    return res.status(500).json({ error: error.message });
  }
}