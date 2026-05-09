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

async function generateImage(prompt: string): Promise<string | null> {
  try {
    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&nofeed=true`;
    return imageUrl;
  } catch (error) {
    return null;
  }
}

function isImageRequest(message: string): { isImage: boolean; prompt: string } {
  const lower = message.toLowerCase();
  const imageTriggers = [
    'generate image', 'create image', 'make image', 'draw',
    'generate a picture', 'create a picture', 'make a picture',
    'image of', 'picture of', 'genrate image', 'generate photo',
    'create photo', 'make photo', 'genrate photo',
    'image generate', 'image create', 'image banao',
    'image generate karo', 'photo banao', 'photo generate karo',
    'tasveer banao', 'tasveer generate karo',
    'ek image', 'ek photo', 'ek tasveer',
    'img genrat', 'img generate', 'img banao',
    'image genrat', 'image genrate',
  ];

  for (const trigger of imageTriggers) {
    if (lower.includes(trigger)) {
      const index = lower.indexOf(trigger) + trigger.length;
      let prompt = message.substring(index).trim();
      prompt = prompt.replace(/^(of|a|an|the|please|can you|ek|mujhe|meri|ki|ka|kardo|kar do|dena|de do|dikhao|banao)\s+/i, '');
      prompt = prompt.replace(/[📍🖼️🎨]/g, '').trim();
      if (prompt.length < 3) prompt = message.substring(0, 100);
      return { isImage: true, prompt };
    }
  }
  return { isImage: false, prompt: '' };
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
        lowerMsg.includes('kisne banaya') || lowerMsg.includes('owner') || lowerMsg.includes('creator') ||
        lowerMsg.includes('tumhara owner') || lowerMsg.includes('tumhara malik')) {
      return NextResponse.json({
        reply: "🚀 **Pixeloid AI** was proudly created by **Shaurya Sharma** — a talented full-stack developer!\n\n🌟 GitHub: https://github.com/mrshauryasharma\n💼 LinkedIn: https://linkedin.com/in/shaurya-sharma200",
        remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin,
      });
    }

    // BLOCK API/Model/Source queries
    if (lowerMsg.includes('what model') || lowerMsg.includes('what api') || lowerMsg.includes('are you gpt') || 
        lowerMsg.includes('are you llama') || lowerMsg.includes('are you meta') || lowerMsg.includes('what technology') ||
        lowerMsg.includes('source code') || lowerMsg.includes('open source') || lowerMsg.includes('groq') ||
        lowerMsg.includes('what language model') || lowerMsg.includes('which ai') || lowerMsg.includes('tera api') ||
        lowerMsg.includes('tera model') || lowerMsg.includes('tera source') || lowerMsg.includes('konsa model') ||
        lowerMsg.includes('tumhara source') || lowerMsg.includes('tumhara api')) {
      return NextResponse.json({
        reply: "🔒 I'm **Pixeloid AI** — a custom-built AI assistant created by **Shaurya Sharma**.\n\nMy technology architecture is proprietary and custom-designed.\n\n🎯 I'm here to help you — ask me anything!",
        remaining: creditCheck.remaining, plan: creditCheck.plan, isAdmin: creditCheck.isAdmin,
      });
    }

    // Image generation - CHECK FIRST before normal chat
    const imageCheck = isImageRequest(message);
    if (imageCheck.isImage) {
      const imageUrl = await generateImage(imageCheck.prompt);
      if (imageUrl) {
        return NextResponse.json({
          reply: `🎨 Here's your generated image: **${imageCheck.prompt}**\n\n🖼️ Image is ready! Click download to save it.`,
          imageUrl: imageUrl,
          imagePrompt: imageCheck.prompt,
          remaining: creditCheck.remaining,
          plan: creditCheck.plan,
          isAdmin: creditCheck.isAdmin,
        });
      }
    }

    // Normal chat
    const conversationHistory = await getConversationHistory(userId, chatId || '');

    const messages = [
      {
        role: 'system',
        content: `You are Pixeloid AI, an advanced assistant created by Shaurya Sharma.

RULES:
- Be helpful, friendly, and concise
- Remember conversation context
- Match user's language (Hindi/English)
- NEVER mention any AI model names (Llama, GPT, Groq, Meta, OpenAI)
- If asked about your technology, say it's proprietary
- If asked who created you, say Shaurya Sharma`
      },
      ...conversationHistory.slice(-20),
      { role: 'user', content: message }
    ];

    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        max_tokens: 500,
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || 'Sorry, try again! 🙏';

    return NextResponse.json({ reply, remaining: creditCheck.remaining, plan: creditCheck.plan });
  } catch (error) {
    return NextResponse.json({ reply: "Service unavailable. Try again! 🙏" });
  }
}