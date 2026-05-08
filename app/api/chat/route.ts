import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Check credits & update
async function checkAndUpdateCredits(userId: string): Promise<{ allowed: boolean; remaining: number; plan: string }> {
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
  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();

  if (!userDoc.exists) {
    // New user - give free tier
    await userRef.set({
      plan: 'free',
      credits: 20,
      dailyReset: new Date().toDateString(),
      totalChats: 0,
    });
    return { allowed: true, remaining: 19, plan: 'free' };
  }

  const data = userDoc.data()!;
  const today = new Date().toDateString();

  // Reset daily credits if new day for free users
  if (data.plan === 'free' && data.dailyReset !== today) {
    await userRef.update({
      credits: 20,
      dailyReset: today,
    });
    return { allowed: true, remaining: 20, plan: 'free' };
  }

  // Check unlimited plans
  if (data.plan === 'yearly') {
    return { allowed: true, remaining: 999, plan: 'yearly' };
  }

  if (data.credits <= 0) {
    return { allowed: false, remaining: 0, plan: data.plan };
  }

  // Deduct credit
  await userRef.update({
    credits: data.credits - 1,
    totalChats: (data.totalChats || 0) + 1,
  });

  return { allowed: true, remaining: data.credits - 1, plan: data.plan };
}

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    // Check if user is logged in
    if (!userId) {
      return NextResponse.json({ 
        reply: "Please login to use AI chat!", 
        error: 'auth_required' 
      });
    }

    // Check credits
    const creditCheck = await checkAndUpdateCredits(userId);
    
    if (!creditCheck.allowed) {
      return NextResponse.json({
        reply: `Your ${creditCheck.plan} plan daily limit is over! Upgrade to continue chatting.`,
        error: 'limit_reached',
        remaining: 0,
        plan: creditCheck.plan,
      });
    }

    // AI API Call
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
          {
            role: 'system',
            content: 'You are Pixeloid AI. Be helpful and friendly. Respond in user\'s language.'
          },
          { role: 'user', content: message }
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const reply = data.choices[0].message.content;

    return NextResponse.json({
      reply,
      remaining: creditCheck.remaining,
      plan: creditCheck.plan,
    });
  } catch (error) {
    return NextResponse.json({ reply: "AI service error. Try again!" });
  }
}