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
  if (adminDoc.exists) return { allowed: true, remaining: 999999, plan: 'admin', isAdmin: true };

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

// Get conversation history
async function getConversationHistory(userId: string, chatId: string): Promise<Array<{role: string, content: string}>> {
  if (!chatId) return [];
  
  const db = getFirestore();
  const messagesRef = db.collection('users').doc(userId).collection('chats').doc(chatId).collection('messages');
  const snapshot = await messagesRef.orderBy('timestamp', 'asc').limit(20).get();
  
  const history: Array<{role: string, content: string}> = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    history.push({ role: data.role, content: data.content });
  });
  return history;
}

export async function POST(request: Request) {
  try {
    const { message, userId, email, chatId } = await request.json();
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
        lowerMsg.includes('creator') || lowerMsg.includes('malik') || lowerMsg.includes('banane wala')) {
      return NextResponse.json({
        reply: "🚀 **Pixeloid AI** was proudly created by **Shaurya Sharma** — a talented full-stack developer!\n\n💡 He built this platform to help people with daily tasks using smart AI.\n🌟 GitHub: https://github.com/mrshauryasharma",
        remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin,
      });
    }

    // About Pixeloid
    if (lowerMsg.includes('what is pixeloid') || lowerMsg.includes('about pixeloid') || lowerMsg.includes('pixeloid kya hai')) {
      return NextResponse.json({
        reply: "🌟 **Pixeloid** is an AI-powered daily life assistant created by **Shaurya Sharma**.\n\n✨ Features:\n• 🤖 Smart AI Chat with memory\n• 📊 Usage Dashboard\n• 💰 Free (20/day) + Paid Plans\n• 🔒 Google Login\n• 📱 Mobile Friendly",
        remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin,
      });
    }

    // Get conversation history
    const conversationHistory = await getConversationHistory(userId, chatId || '');

    // Build messages array with system prompt + history
    const messages = [
      {
        role: 'system',
        content: `You are Pixeloid AI, a friendly and helpful assistant created by Shaurya Sharma. 
        
CRITICAL RULES:
- REMEMBER everything the user tells you in this conversation (their name, preferences, topics discussed)
- If user told you their name, ALWAYS use it in responses
- NEVER say "I don't remember" if they already told you something in this chat
- Keep responses short (2-4 sentences) unless asked for details
- Use warm, friendly tone with occasional emojis
- Respond in user's language (Hindi/English)
- If you don't know something new, admit it honestly
- Never reset context unless user starts completely new topic`
      },
      ...conversationHistory.slice(-16), // Last 16 messages for context
      { role: 'user', content: message }
    ];

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 300,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not process that. Please try again! 🙏';

    return NextResponse.json({ reply, remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin });
  } catch (error) {
    return NextResponse.json({ reply: "AI service temporarily unavailable. Please try again later! 🙏" });
  }
}