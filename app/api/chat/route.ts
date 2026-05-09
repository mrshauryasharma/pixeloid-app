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
  const adminDoc = await db.collection('admins').doc(email).get();
  if (adminDoc.exists) {
    return { allowed: true, remaining: 999999, plan: 'admin', isAdmin: true };
  }

  const userRef = db.collection('users').doc(userId);
  const userDoc = await userRef.get();
  const today = new Date().toDateString();

  if (!userDoc.exists) {
    await userRef.set({ email, plan: 'free', credits: 19, dailyReset: today, totalChats: 0, createdAt: new Date() });
    return { allowed: true, remaining: 19, plan: 'free', isAdmin: false };
  }

  const data = userDoc.data()!;
  if (!data.email) await userRef.update({ email });

  if (data.plan === 'yearly') return { allowed: true, remaining: 999, plan: 'yearly', isAdmin: false };
  if (data.plan === 'free' && data.dailyReset !== today) {
    await userRef.update({ credits: 20, dailyReset: today });
    return { allowed: true, remaining: 20, plan: 'free', isAdmin: false };
  }
  if (data.credits <= 0) return { allowed: false, remaining: 0, plan: data.plan, isAdmin: false };

  await userRef.update({ credits: data.credits - 1, totalChats: (data.totalChats || 0) + 1 });
  return { allowed: true, remaining: data.credits - 1, plan: data.plan, isAdmin: false };
}

export async function POST(request: Request) {
  try {
    const { message, userId, email } = await request.json();
    if (!userId) return NextResponse.json({ reply: "Please login to use AI chat!", error: 'auth_required' });

    const creditCheck = await checkCredits(userId, email || '');
    if (!creditCheck.allowed) {
      return NextResponse.json({
        reply: `⚠️ Your daily limit is over!\n\n💎 Upgrade:\n• Weekly ₹15 — 100 chats\n• Monthly ₹60 — 200 chats\n• Yearly ₹499 — Unlimited`,
        error: 'limit_reached', remaining: 0, plan: creditCheck.plan,
      });
    }

    const lowerMsg = message.toLowerCase();

    // Creator queries
    if (lowerMsg.includes('who made') || lowerMsg.includes('who created') || lowerMsg.includes('who built') || 
        lowerMsg.includes('who developed') || lowerMsg.includes('kisne banaya') || lowerMsg.includes('owner') || 
        lowerMsg.includes('creator') || lowerMsg.includes('malik') || lowerMsg.includes('banane wala') ||
        lowerMsg.includes('kiska hai') || lowerMsg.includes('who are you made by')) {
      return NextResponse.json({
        reply: "🚀 **Pixeloid AI** was proudly created by **Shaurya Sharma** — a talented full-stack developer!\n\n💡 He built this platform to help people with daily tasks using smart AI.\n🌟 GitHub: https://github.com/mrshauryasharma\n\nI'm here to assist you 24/7 — ask me anything!",
        remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin,
      });
    }

    // About Pixeloid
    if (lowerMsg.includes('what is pixeloid') || lowerMsg.includes('about pixeloid') || lowerMsg.includes('pixeloid kya hai')) {
      return NextResponse.json({
        reply: "🌟 **Pixeloid** is an AI-powered daily life assistant created by **Shaurya Sharma**.\n\n✨ Features:\n• 🤖 Smart AI Chat\n• 📊 Usage Dashboard\n• 💰 Free & Paid Plans\n• 🔒 Secure Login\n• 📱 Mobile Friendly\n\nTry it now — it's free!",
        remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin,
      });
    }

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are Pixeloid AI, a helpful and friendly assistant created by Shaurya Sharma. 
Rules:
- Keep responses concise (2-4 sentences max unless asked for details)
- Be warm, friendly, and slightly casual
- Use emojis occasionally to be engaging
- When asked about your creator, proudly mention Shaurya Sharma
- If asked about Pixeloid features, mention: AI Chat, Dashboard, Free plan (20 chats/day), Weekly (₹15/100 chats), Monthly (₹60/200 chats), Yearly (₹499/unlimited)
- Respond in the same language the user uses (English or Hindi)
- Never give harmful, illegal, or unethical advice
- If you don't know something, admit it honestly`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that. Please try again!';

    return NextResponse.json({ reply, remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin });
  } catch (error) {
    return NextResponse.json({ reply: "AI service temporarily unavailable. Please try again later! 🙏" });
  }
}