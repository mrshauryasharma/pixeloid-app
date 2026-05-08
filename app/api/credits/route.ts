import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

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
    const today = new Date().toDateString();

    if (!userDoc.exists) {
      await userRef.set({
        plan: 'free',
        credits: 20,
        dailyReset: today,
        totalChats: 0,
      });
      return NextResponse.json({ credits: 20, plan: 'free', totalChats: 0 });
    }

    const data = userDoc.data()!;

    if (data.plan === 'free' && data.dailyReset !== today) {
      await userRef.update({
        credits: 20,
        dailyReset: today,
      });
      return NextResponse.json({ credits: 20, plan: 'free', totalChats: data.totalChats || 0 });
    }

    return NextResponse.json({
      credits: data.plan === 'yearly' ? 999 : (data.credits || 0),
      plan: data.plan || 'free',
      totalChats: data.totalChats || 0,
    });
  } catch (error) {
    console.error('Credits API Error:', error);
    return NextResponse.json({ credits: 20, plan: 'free', totalChats: 0 });
  }
}