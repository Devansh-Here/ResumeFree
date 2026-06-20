// api/create-order.js — Vercel Serverless Function
// Creates a Razorpay order. Called by the frontend before opening checkout.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { plan } = req.body || {};
  const AMOUNTS = { monthly: 19900, yearly: 49900 }; // paise
  const amount = AMOUNTS[plan];

  if (!amount) {
    return res.status(400).json({ error: "Invalid plan" });
  }

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
        notes: { plan },
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