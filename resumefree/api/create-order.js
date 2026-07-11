// api/create-order.js — Vercel Serverless Function
// Creates a Razorpay order. Called by the frontend before opening checkout.
//
// FIXED: this file was still on the old subscription model (`plan`:
// 'monthly'/'yearly', hardcoded paise amounts). UpgradeModal.jsx sends
// `pass_type` ('sprint' | 'placement' | 'season' | 'addon_*') per the
// Section 5m pass-based pricing migration — that mismatch is why every
// purchase attempt threw "Invalid plan" regardless of which pass was
// selected. Now reads `pass_type` and derives the amount server-side from
// PASS_DETAILS (single source of truth), so the client can never influence
// the amount actually charged.
import { PASS_DETAILS } from "../src/utils/passes.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { pass_type } = req.body || {};
  const pass = PASS_DETAILS[pass_type];

  if (!pass) {
    return res.status(400).json({ error: "Invalid plan" });
  }

  // PASS_DETAILS prices are in rupees — Razorpay needs paise.
  const amount = pass.price * 100;

  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(500).json({ error: "Razorpay keys not configured" });
  }

  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `rcpt_${Date.now()}`,
        notes: { pass_type },
      }),
    });

    const order = await response.json();

    if (!response.ok) {
      return res
        .status(502)
        .json({ error: order.error?.description || "Razorpay order creation failed" });
    }

    return res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}