import { NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ isAdmin: false, error: 'No email provided' });
    }

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

    if (!adminDoc.exists) {
      return NextResponse.json({ isAdmin: false, error: 'Not an admin' });
    }

    const adminData = adminDoc.data();
    return NextResponse.json({
      isAdmin: true,
      role: adminData?.role || 'admin',
    });
  } catch (error) {
    console.error('Admin check error:', error);
    return NextResponse.json({ isAdmin: false, error: 'Server error' });
  }
}