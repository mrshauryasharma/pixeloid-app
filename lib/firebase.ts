import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB25m2Y_BZTxwzickLgdUViBKCJQPo15Rs",
  authDomain: "pixeloid-pro.firebaseapp.com",
  projectId: "pixeloid-pro",
  storageBucket: "pixeloid-pro.firebasestorage.app",
  messagingSenderId: "169676409543",
  appId: "1:169676409543:web:a28440b9e1b0b6a9bdcce2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);