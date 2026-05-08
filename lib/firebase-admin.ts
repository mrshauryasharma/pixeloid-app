import { initializeApp, getApps, cert } from 'firebase-admin/app';

export function getFirebaseAdmin() {
  if (!getApps().length) {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error('FIREBASE_PRIVATE_KEY is missing');
    }

    initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
        privateKey: privateKey.replace(/\\n/g, '\n'),
      }),
    });
  }
}