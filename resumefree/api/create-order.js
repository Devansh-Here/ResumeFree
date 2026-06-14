// Vercel Serverless Function: Create Razorpay Order
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // TODO: Implement Razorpay order creation
    return res.status(200).json({ message: 'Create order endpoint ready' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
