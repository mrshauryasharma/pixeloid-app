import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function GET() {
  try {
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
    const snapshot = await db.collection('users').get();
    const users: any[] = [];
    
    snapshot.forEach(doc => {
      users.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json({ users });
  } catch (error) {
    return NextResponse.json({ users: [] });
  }
}