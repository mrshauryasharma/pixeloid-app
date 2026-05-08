import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const { planType } = await request.json();
    
    const planPrices: Record<string, number> = {
      weekly: 9900,
      monthly: 29900,
      yearly: 299900,
    };

    const order = await razorpay.orders.create({
      amount: planPrices[planType],
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: { planType },
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 });
  }
}