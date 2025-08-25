import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { debugFirebaseConfig } from '../utils/debug';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Debug configuration
debugFirebaseConfig();
console.log('Initializing Firebase with config:', { projectId: firebaseConfig.projectId });

// Initialize Firebase app if it hasn't been initialized
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
  console.log('Firebase app initialized successfully');
} else {
  app = getApps()[0];
  console.log('Using existing Firebase app');
}

// Initialize services
export const auth = getAuth(app);
export const firestore = getFirestore(app);
export const storage = getStorage(app);

console.log('Firebase services initialized');

export default app;