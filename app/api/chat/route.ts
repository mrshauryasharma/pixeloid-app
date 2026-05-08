import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

async function checkCredits(userId: string, email: string): Promise<{ allowed: boolean; remaining: number; plan: string; isAdmin: boolean }> {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  const db = getFirestore();

  // Check if admin
  const adminDoc = await db.collection('admins').doc(email).get();
  if (adminDoc.exists) {
    return { allowed: true, remaining: 999999, plan: 'admin', isAdmin: true };
  }

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const today = new Date().toDateString();

  if (!userDoc.exists) {
    await userRef.set({
      email: email,
      plan: 'free',
      credits: 19,
      dailyReset: today,
      totalChats: 0,
      createdAt: new Date(),
    });
    return { allowed: true, remaining: 19, plan: 'free', isAdmin: false };
  }

  const data = userDoc.data()!;

  // Update email if missing
  if (!data.email) {
    await userRef.update({ email: email });
  }

  if (data.plan === 'yearly') {
    return { allowed: true, remaining: 999, plan: 'yearly', isAdmin: false };
  }

  if (data.plan === 'free' && data.dailyReset !== today) {
    await userRef.update({ credits: 20, dailyReset: today });
    return { allowed: true, remaining: 20, plan: 'free', isAdmin: false };
  }

  if (data.credits <= 0) {
    return { allowed: false, remaining: 0, plan: data.plan, isAdmin: false };
  }

  await userRef.update({
    credits: data.credits - 1,
    totalChats: (data.totalChats || 0) + 1,
  });

  return { allowed: true, remaining: data.credits - 1, plan: data.plan, isAdmin: false };
}

export async function POST(request: Request) {
  try {
    const { message, userId, email } = await request.json();

    if (!userId) {
      return NextResponse.json({ reply: "Please login to use AI chat!", error: 'auth_required' });
    }

    const creditCheck = await checkCredits(userId, email || '');

    if (!creditCheck.allowed) {
      return NextResponse.json({
        reply: `⚠️ Your daily limit is over!\n\n💎 Upgrade:\n• Weekly ₹15 — 100 chats\n• Monthly ₹60 — 200 chats\n• Yearly ₹499 — Unlimited`,
        error: 'limit_reached',
        remaining: 0,
        plan: creditCheck.plan,
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are Pixeloid AI. Be helpful and friendly. Keep responses short.' },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that.';

    return NextResponse.json({
      reply,
      remaining: creditCheck.remaining,
      plan: creditCheck.plan,
      isAdmin: creditCheck.isAdmin,
    });
  } catch (error) {
    return NextResponse.json({ reply: "AI service error. Try again later!" });
  }
}