import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  const { userId, plan } = await request.json();
  
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
  const creditsMap: Record<string, number> = {
    free: 20,
    weekly: 100,
    monthly: 200,
    yearly: 999999,
  };

  await db.collection('users').doc(userId).update({
    plan,
    credits: creditsMap[plan] || 20,
  });

  return NextResponse.json({ success: true });
}