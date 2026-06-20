// api/verify-payment.js — Vercel Serverless Function
// Verifies a completed Razorpay payment, then marks the user premium in Supabase.
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

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
    plan,
    amount,
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !email || !plan) {
    return res.status(400).json({ error: "Missing required fields" });
  }

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

    // 3. Calculate premium expiry
    const expiresAt = new Date();
    if (plan === "yearly") {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    } else {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // 4. Upsert profile — this is what makes the user "premium"
    const { error: profileErr } = await supabaseAdmin.from("profiles").upsert({
      id: userId,
      email,
      name: name || null,
      is_premium: true,
      premium_plan: plan,
      premium_expires_at: expiresAt.toISOString(),
    });
    if (profileErr) throw profileErr;

    // 5. Record the payment for history/support purposes
    const { error: paymentErr } = await supabaseAdmin.from("payments").insert({
      profile_id: userId,
      razorpay_order_id,
      razorpay_payment_id,
      amount: amount || 0,
      plan,
      status: "success",
    });
    if (paymentErr) throw paymentErr;

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("verify-payment error:", error);
    return res.status(500).json({ error: error.message });
  }
}